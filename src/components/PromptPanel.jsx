
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, MenuItem, Slider, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { getPromptExamples } from '../content/promptExamples';
import { useI18n } from '../i18n/I18nProvider';
import { LANGUAGE_OPTIONS } from '../i18n/translations';

const STRATEGIES = ['greedy', 'top-k', 'top-p'];

export default function PromptPanel(props) {
  const {
    prompt, setPrompt, maxNewTokens, setMaxNewTokens, topK, setTopK, topP, setTopP, temperature, setTemperature, seed, setSeed,
    decodingStrategy, setDecodingStrategy, running, loadingModel, model, error, onLoadModel, onRun, onNext, onBack,
    onReset, activeStep, maxStep, mode, setMode, onOpenGlossary, onExportTrace, traceAvailable,
    localePreference, setLocalePreference, promptLocale, getLanguageLabel,
  } = props;
  const { locale, t } = useI18n();
  const examples = useMemo(() => getPromptExamples(promptLocale || locale), [promptLocale, locale]);

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="h6">{t('session.title')}</Typography>
        <Typography variant="body2" color="text.secondary">{t('session.subtitle')}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
        <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_e, value) => value && setMode(value)}>
          <ToggleButton value="beginner">{t('mode.beginner')}</ToggleButton>
          <ToggleButton value="technical">{t('mode.technical')}</ToggleButton>
        </ToggleButtonGroup>
        <Button size="small" variant="text" startIcon={<MenuBookIcon />} onClick={onOpenGlossary} sx={{ color: 'text.secondary' }}>{t('button.glossary')}</Button>
      </Stack>

      <TextField
        select
        size="small"
        label={t('language.label')}
        value={localePreference}
        onChange={(event) => setLocalePreference(event.target.value)}
        helperText={promptLocale ? t('language.prompt', { language: getLanguageLabel(promptLocale) }) : null}
      >
        {LANGUAGE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label || t(option.labelKey)}</MenuItem>)}
      </TextField>

      <Divider sx={{ opacity: 0.5 }} />

      <TextField label={t('field.prompt')} multiline minRows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />

      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {examples.map((example) => (
          <Button key={example} size="small" variant="outlined" onClick={() => setPrompt(example)} sx={{ fontSize: '0.7rem', px: 1, py: 0.2 }}>
            {example.slice(0, 20)}...
          </Button>
        ))}
      </Stack>

      <TextField select size="small" label={t('field.strategy')} value={decodingStrategy} onChange={(event) => setDecodingStrategy(event.target.value)}>
        {STRATEGIES.map((strategy) => <MenuItem key={strategy} value={strategy}>{t(`strategy.${strategy}`)}</MenuItem>)}
      </TextField>

      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('field.seed', { value: seed })}</Typography>
        <Slider size="small" min={1} max={9999} step={1} value={seed} onChange={(_e, value) => setSeed(value)} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('field.maxNewTokens', { value: maxNewTokens })}</Typography>
        <Slider size="small" min={1} max={6} step={1} value={maxNewTokens} onChange={(_e, value) => setMaxNewTokens(value)} />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t('field.topK', { value: topK })}</Typography>
        <Slider size="small" min={3} max={20} step={1} value={topK} onChange={(_e, value) => setTopK(value)} />
      </Stack>

      {error ? <Alert severity="error" sx={{ py: 0 }}>{error}</Alert> : null}

      <Stack spacing={1}>
        <Button fullWidth variant="contained" startIcon={<PlayArrowIcon />} onClick={onRun} disabled={running || loadingModel || !model.loaded} sx={{ py: 1 }}>{running ? t('button.running') : t('button.run')}</Button>
        <Stack direction="row" spacing={1}>
          <Button fullWidth size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={onLoadModel} disabled={loadingModel || running}>{loadingModel ? '...' : t('button.reloadModel')}</Button>
          <Button fullWidth size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={onExportTrace} disabled={!traceAvailable}>{t('button.exportTrace')}</Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button size="small" variant="text" onClick={onBack} disabled={activeStep <= 0}>{t('button.previous')}</Button>
        <Button size="small" variant="text" onClick={onNext} disabled={activeStep >= maxStep}>{t('button.next')}</Button>
        <Button size="small" variant="text" onClick={onReset} sx={{ color: 'text.secondary' }}>{t('button.reset')}</Button>
      </Stack>
    </Stack>
  );
}
