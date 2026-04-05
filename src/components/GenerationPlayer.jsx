
import { useEffect, useState } from 'react';
import { Box, Button, Chip, Slider, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useI18n } from '../i18n/I18nProvider';

export default function GenerationPlayer({ generationSteps, selectedStep, onStepChange }) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || !generationSteps?.length) return undefined;
    const timer = globalThis.setInterval(() => {
      onStepChange((current) => {
        const next = Number(current) + 1;
        if (next >= generationSteps.length) {
          setPlaying(false);
          return generationSteps.length - 1;
        }
        return next;
      });
    }, 1200);
    return () => globalThis.clearInterval(timer);
  }, [playing, generationSteps, onStepChange]);

  if (!generationSteps?.length) return null;

  const current = generationSteps[selectedStep] ?? generationSteps[0];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 200 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => setPlaying((value) => !value)}
            startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}
            sx={{ minWidth: 100 }}
          >
            {playing ? t('button.pause') : t('button.play')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {t('player.step', { current: selectedStep + 1, total: generationSteps.length })}
          </Typography>
        </Stack>

        <Box sx={{ flex: 1, px: 2 }}>
          <Slider
            size="small"
            min={0}
            max={generationSteps.length - 1}
            step={1}
            value={selectedStep}
            onChange={(_event, value) => onStepChange(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `t${Number(value) + 1}`}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <Chip
            size="small"
            label={t('player.focusToken', { value: current.tokensDisplay?.[current.focusIndex] || '—' })}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={t('player.chosenToken', { value: current.chosenTokenText || '—' })}
            color="secondary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={t('player.strategy', { value: t(`strategy.${current.strategy}`) })}
            variant="outlined"
          />
        </Stack>
      </Stack>
    </Box>
  );
}
