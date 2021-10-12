import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumericInput, Popover, H5, H6, Tooltip, Icon } from '@blueprintjs/core';
import s from './Databar.scss';

type Props = {
  filePath: string | undefined;
  onDataImportClick: Function;
  onEventsUpdateClick: Function;
  onDataExportClick: Function;
};

export default function Databar(props: Props) {
  const { t } = useTranslation();
  const { filePath, onDataImportClick, onEventsUpdateClick, onDataExportClick } = props;
  // eslint-disable-next-line
  const filename = (filePath !== undefined) ? filePath.replace(/^.*[\\\/]/, '') : "";

  return (
    <div className={s.container}>
      <div className={s.textOutput}>
        <H5 title={t('explore.dataFileLoaded')}>{`${t('explore.dataFileLoaded')}:`}</H5>
        <H5>{filename}</H5>
      </div>
      <Button
        icon="arrow-left"
        intent="primary"
        large
        onClick={() => onDataImportClick()}
        outlined={false}
        style={{ marginRight: '15px' }}
        text={t('explore.changeFile')}
      />
      <Popover className={s.popover} usePortal={false} placement="bottom-start" autoFocus={false}>
        <Button
          icon="refresh"
          intent="primary"
          large
          outlined={false}
          style={{ marginRight: '15px' }}
          text={t('explore.eventsButtonLabel')}
        />
        <div className={s.popoverContent}>
          <div className={s.row}>
            <H6 className={s.eventTitle}>{t('explore.eventsDurationLabel')}</H6>
            <Tooltip content={t('explore.eventsDescription')}>
              <Icon className={s.icon} color="#647f80" icon="help" iconSize={28} />
            </Tooltip>
          </div>
          <div className={s.row}>
            <NumericInput
              className={s.eventDurationInput}
              intent="primary"
              fill
              leftIcon="stopwatch"
              max={60}
              min={0}
              placeholder="30 min"
            />
            <Button
              className={s.eventApplyButton}
              intent="primary"
              onClick={() => onEventsUpdateClick()}
              outlined={false}
              text="OK"
            />
          </div>
        </div>
      </Popover>
      <Button
        icon="export"
        intent="primary"
        large
        onClick={() => onDataExportClick()}
        outlined={false}
        text={t('explore.overridesExport')}
      />
    </div>
  );
}
