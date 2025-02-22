import { Button } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import '@blueprintjs/popover2/lib/css/blueprint-popover2.css';
import { TFunction } from 'i18next';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import path from 'path';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';

import { EmptyClasses } from '../constants/animalsClasses';
import AnimalsListTooltipContent from './AnimalsListTooltipContent';
import styles from './Map.module.scss';

/*
To produce a country file please have a look at download_map.sh
Useful tutorial - https://digitalki.net/2017/12/13/offline-maps-with-mapbox-gl-js-and-electron/
Possible style inspirations:
https://github.com/maputnik/osm-liberty
https://github.com/Toshiwoz/terry-mapper
https://github.com/mapbox/mapbox-gl-styles
https://github.com/klokantech/mapbox-gl-js-offline-example
*/

/* eslint-disable no-param-reassign */
/* eslint-disable global-require */

// STYLE FILE PREPROCESSING
const mapboxStyle = require('../../../assets/map-style.json');

mapboxStyle.sources.jsonsource = {
  type: 'geojson',
  data: require('../../../assets/map-sources/africa.json'),
};

// COMPONENT RENDERING

function getObservationCoordinates(row: Observation): [number, number] {
  return [row.coordinates_long, row.coordinates_lat];
}

function makeStationMarker(
  t: TFunction,
  groupObservations: Observation[],
  species: _.Collection<string>,
  setInspectedObservations: (observations: Observation[]) => void,
  photosPath: string
) {
  // Observations from a single station should have approximately identical
  // coordinates, so we can pick any.
  const firstObservation = groupObservations[0];
  const coordinates = getObservationCoordinates(firstObservation);
  const count = groupObservations.length;
  const { station } = firstObservation;

  const maxPreviewPhotosCount = 3;

  const markerElement = document.createElement('div');
  markerElement.className = styles.marker;
  if (markerElement) {
    markerElement.addEventListener('click', (event: Event) => {
      const activeMarkers: NodeListOf<Element> = document.querySelectorAll(
        `.${styles.marker}.${styles.active}`
      );
      activeMarkers.forEach((marker) => marker.classList.remove(styles.active));
      const target = event.currentTarget as HTMLTextAreaElement;
      target.classList.add(styles.active);
    });
  }

  const popupContentPlaceholder = document.createElement('div');
  createRoot(popupContentPlaceholder).render(
    <>
      <h3>
        <b>{t('explore.inspect.station', { id: station }) as string}</b>
      </h3>
      <p>
        <b>{t('explore.inspect.observations', { count }) as string}</b>
      </p>
      <Tooltip2
        content={<AnimalsListTooltipContent entries={species.value()} />}
        openOnTargetFocus={false}
        placement="bottom"
      >
        <b>{t('explore.inspect.species', { count: species.size() }) as string}</b>
      </Tooltip2>

      <div className={styles.photosPreview}>
        {groupObservations.slice(0, maxPreviewPhotosCount).map((observation) => (
          // eslint-disable-next-line
          <a
            key={observation.location}
            className={styles.photosPreviewItem}
            onClick={() => setInspectedObservations(groupObservations)}
          >
            <img
              src={`file:${path.join(photosPath, observation.location)}`}
              alt="Observations preview"
            />
          </a>
        ))}
        <div>
          <Button
            onClick={() => setInspectedObservations(groupObservations)}
            className={styles.photosPreviewItem}
            rightIcon="arrow-right"
            intent="primary"
          />
        </div>
      </div>
    </>
  );

  const marker = new mapboxgl.Marker(markerElement, { anchor: 'bottom' })
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContentPlaceholder));
  return marker;
}

function addMarkers(
  t: TFunction,
  observations: Observation[],
  map: mapboxgl.Map,
  setInspectedObservations: (observations: Observation[]) => void,
  photosPath: string
) {
  // TODO: Drop observations with missing station and warn the user.
  const markers = _(observations)
    .groupBy((x) => x.station)
    .map((group) => ({
      species: _(group)
        .filter((x) => !EmptyClasses.includes(x.pred_1))
        .map('pred_1')
        .uniq(),
      observations: group,
    }));

  const maxSpecies = markers.map((x) => x.species.size()).max();
  if (maxSpecies !== undefined) {
    map.on('load', () => {
      markers.forEach((group) => {
        const marker = makeStationMarker(
          t,
          group.observations,
          group.species,
          setInspectedObservations,
          photosPath
        );
        marker.addTo(map);
      });
    });
  }
}

type MapProps = {
  observations: Observation[];
  onInspect: (observations: Observation[]) => void;
  photosPath: string;
};

export default function Map(props: MapProps) {
  const { observations, onInspect, photosPath } = props;
  const mapRef = React.createRef<HTMLDivElement>();
  const { t } = useTranslation();

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current as HTMLElement,
      style: mapboxStyle,
      center: [12, -0.8],
      zoom: 6,
    });
    addMarkers(t, observations, map, onInspect, photosPath);
    return function cleanup() {
      map.remove();
    };
  }, [mapRef, observations, onInspect, t, photosPath]);

  return <div ref={mapRef} className={styles.mapContainer} />;
}
