import { NumberRange, RangeSlider } from '@blueprintjs/core';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CertaintyFilter.module.scss';

type CertaintyFilterProps = {
  updateFilters: Function; // eslint-disable-line @typescript-eslint/ban-types
};

export default function CertaintyFilter({ updateFilters }: CertaintyFilterProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<NumberRange>([0, 100]);

  const updateFilter = (newRange: NumberRange) => {
    const [low, high] = newRange;
    updateFilters({ certaintyRange: [low / 100, high / 100] });
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.label}>{t('explore.certaintyRange')}</h4>
      <RangeSlider
        min={0}
        max={100}
        labelStepSize={20}
        labelRenderer={(value) => `${value}%`}
        value={range}
        onChange={(newRange: NumberRange) => {
          setRange(newRange);
          updateFilter(newRange);
        }}
      />
    </div>
  );
}
