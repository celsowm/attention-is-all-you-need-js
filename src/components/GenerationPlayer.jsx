
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Slider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">{t('player.title')}</Typography>
            <Typography color="text.secondary">{t('player.subtitle')}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setPlaying((value) => !value)}>{playing ? t('button.pause') : t('button.play')}</Button>
          </Stack>

          <Box>
            <Typography gutterBottom>{t('player.step', { current: selectedStep + 1, total: generationSteps.length })}</Typography>
            <Slider min={0} max={generationSteps.length - 1} step={1} marks value={selectedStep} onChange={(_event, value) => onStepChange(value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `t${Number(value) + 1}`} />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={t('player.focusToken', { value: current.tokensDisplay?.[current.focusIndex] || '—' })} color="primary" />
            <Chip label={t('player.chosenToken', { value: current.chosenTokenText || '—' })} color="secondary" variant="outlined" />
            <Chip label={t('player.strategy', { value: t(`strategy.${current.strategy}`) })} variant="outlined" />
            <Chip label={t('player.poolSize', { value: current.candidatePoolSize || 0 })} variant="outlined" />
            <Chip label={t('player.poolMass', { value: current.candidatePoolMass || 0 })} variant="outlined" />
            <Chip label={t('player.stepMs', { value: current.metrics?.forwardMs || 0 })} variant="outlined" />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">{t('player.state')}</Typography>
            <Typography variant="body2"><strong>{t('player.input')}</strong> {current.inputText}</Typography>
            <Typography variant="body2"><strong>{t('player.output')}</strong> {current.completion}</Typography>
            <Typography variant="body2"><strong>{t('player.seed')}</strong> {current.sampled ? current.sampleDraw : 'deterministic'}</Typography>
          </Stack>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('player.candidates')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.token')}</TableCell>
                  <TableCell>{t('table.logit')}</TableCell>
                  <TableCell>{t('table.probability')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {current.topLogits.map((item) => (
                  <TableRow key={`${current.step}-${item.tokenId}`} selected={item.token === current.chosenTokenText}>
                    <TableCell>{item.token}</TableCell>
                    <TableCell>{item.logit}</TableCell>
                    <TableCell>{item.probability}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{t('player.poolBreakdown')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('player.poolHint')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.token')}</TableCell>
                  <TableCell>{t('table.probability')}</TableCell>
                  <TableCell>{t('table.normalizedProbability')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(current.candidatePool || []).map((item) => (
                  <TableRow key={`${current.step}-pool-${item.tokenId ?? item.index}`} selected={item.token === current.chosenTokenText}>
                    <TableCell>{item.token}</TableCell>
                    <TableCell>{item.probability}</TableCell>
                    <TableCell>{item.normalizedProbability}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{t('player.compare')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('player.compareHint')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.strategy')}</TableCell>
                  <TableCell>{t('table.token')}</TableCell>
                  <TableCell>{t('table.probability')}</TableCell>
                  <TableCell>{t('table.normalizedProbability')}</TableCell>
                  <TableCell>{t('table.pool')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(current.strategyComparison || []).map((item) => (
                  <TableRow key={`${current.step}-${item.strategy}`} selected={item.strategy === current.strategy}>
                    <TableCell>{t(`strategy.${item.strategy}`)}</TableCell>
                    <TableCell>{item.chosenToken}</TableCell>
                    <TableCell>{item.probability}</TableCell>
                    <TableCell>{item.normalizedProbability}</TableCell>
                    <TableCell>{item.poolSize}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
