import { Button, Card, Elevation, Tooltip } from '@blueprintjs/core';
import classNames from 'classnames/bind';
import path from 'path';
import { useTranslation } from 'react-i18next';

import { formatAnimalClassName } from '../constants/animalsClasses';
import { taxonOptions } from '../constants/taxons';
import CreatableSelect from './CreatableSelect';
import styles from './ObservationCard.module.scss';

const cx = classNames.bind(styles);

type ObservationCardProps = {
  observation: Observation;
  predictionOverride?: CreatableOption;
  onPredictionOverride: PredictionsOverrideHandler;
  onPhotoClick: (cardIndex: number | null, cardSelected: boolean) => void;
  onCardSelect: (cardIndex: number, cardSelected: boolean) => void;
  observationIndex: number;
  isMaximized: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
};

function ObservationCard(props: ObservationCardProps) {
  const {
    observation,
    predictionOverride,
    onPredictionOverride,
    onPhotoClick,
    onCardSelect,
    observationIndex,
    isMaximized,
    isSelected,
    isSelectionMode,
  } = props;
  const { t } = useTranslation();

  const topPrediction = {
    value: observation.pred_1,
    label: formatAnimalClassName(observation.pred_1),
  };

  const handlePredictionOverride = (newPrediction: CreatableOption | null) => {
    if (newPrediction === null || newPrediction.value !== topPrediction.value) {
      onPredictionOverride([observation.location], newPrediction);
    }
  };

  const predictions = [
    [formatAnimalClassName(observation.pred_1), observation.score_1],
    [formatAnimalClassName(observation.pred_2), observation.score_2],
    [formatAnimalClassName(observation.pred_3), observation.score_3],
  ];

  const predictionsTable = (
    <table className={`${styles.predictionsTable} bp4-html-table bp4-html-table-condensed`}>
      <thead>
        <tr>
          <th>{t('explore.inspect.prediction')}</th>
          <th>{t('explore.inspect.probability')}</th>
        </tr>
      </thead>
      <tbody>
        {predictions.map((i) => (
          <tr key={i[0]}>
            <td>{i[0]}</td>
            <td>
              {((i[1] as number) * 100).toFixed(2)}
              &nbsp;%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  const predictionOverrideWidget = (
    <CreatableSelect
      value={predictionOverride || topPrediction}
      onChange={handlePredictionOverride}
      options={taxonOptions}
      isDisabled={isSelected}
      isClearable={predictionOverride !== undefined}
      menuShouldScrollIntoView={false}
      menuPlacement="auto"
      controlStyles={{
        background: 'none',
        width: 'auto',
      }}
    />
  );
  const photoDetail = (label: string, value: string) => (
    <p className={styles.photoDetail}>
      <span className={styles.label}>{`${t(`explore.inspect.${label}`)}: `}</span>
      <span>{value}</span>
    </p>
  );
  const photoDetails = (
    <div className={styles.photoDetails}>
      {photoDetail('date', observation.date)}
      {photoDetail('camera', observation.camera)}
      {photoDetail('file', path.basename(observation.location))}
    </div>
  );
  const observationClass = cx({
    observation: true,
    maximized: isMaximized,
    selected: isSelected,
    selectable: isSelectionMode,
  });

  return (
    <div className={observationClass}>
      <Card className={styles.card} elevation={Elevation.TWO} key={observation.location}>
        <div
          className={styles.body}
          onClick={() => onPhotoClick(isMaximized ? null : observationIndex, !isSelected)}
          aria-hidden="true"
        >
          <div className={styles.photo}>
            <img
              className={styles.img}
              src={`file:${observation.location}`}
              alt={observation.pred_1}
            />
            <div className={styles.data}>
              {predictionsTable}
              {photoDetails}
            </div>
          </div>
        </div>
        <div className={styles.header}>
          <Tooltip content={t('explore.inspect.overrideTooltip')} position="top" minimal>
            {predictionOverrideWidget}
          </Tooltip>
          <Button
            className={styles.selectButton}
            icon="tick-circle"
            minimal
            onClick={() => onCardSelect(observationIndex, !isSelected)}
          />
        </div>
      </Card>
    </div>
  );
}

ObservationCard.defaultProps = {
  predictionOverride: undefined,
};

export default ObservationCard;
