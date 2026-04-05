
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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2.25}>
          <Typography variant="h5">{t('session.title')}</Typography>
          <Typography color="text.secondary">{t('session.subtitle')}</Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_e, value) => value && setMode(value)}>
              <ToggleButton value="beginner">{t('mode.beginner')}</ToggleButton>
              <ToggleButton value="technical">{t('mode.technical')}</ToggleButton>
            </ToggleButtonGroup>
            <Button size="small" variant="outlined" startIcon={<MenuBookIcon />} onClick={onOpenGlossary}>{t('button.glossary')}</Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={onExportTrace} disabled={!traceAvailable}>{t('button.exportTrace')}</Button>
          </Stack>

          <TextField
            select
            label={t('language.label')}
            value={localePreference}
            onChange={(event) => setLocalePreference(event.target.value)}
            helperText={promptLocale ? t('language.prompt', { language: getLanguageLabel(promptLocale) }) : t('language.effective', { language: getLanguageLabel(locale) })}
          >
            {LANGUAGE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label || t(option.labelKey)}</MenuItem>)}
          </TextField>

          <Divider />

          <TextField label={t('field.prompt')} multiline minRows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} helperText={t('field.promptHelp')} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {examples.map((example) => (
              <Button key={example} size="small" variant="text" startIcon={<AutoAwesomeIcon />} onClick={() => setPrompt(example)}>
                {example}
              </Button>
            ))}
          </Stack>

          <TextField select label={t('field.strategy')} value={decodingStrategy} onChange={(event) => setDecodingStrategy(event.target.value)}>
            {STRATEGIES.map((strategy) => <MenuItem key={strategy} value={strategy}>{t(`strategy.${strategy}`)}</MenuItem>)}
          </TextField>

          <Stack spacing={1}>
            <Typography gutterBottom>{t('field.seed', { value: seed })}</Typography>
            <Slider min={1} max={9999} step={1} value={seed} onChange={(_e, value) => setSeed(value)} valueLabelDisplay="auto" />
          </Stack>

          <Stack spacing={1}>
            <Typography gutterBottom>{t('field.maxNewTokens', { value: maxNewTokens })}</Typography>
            <Slider min={1} max={6} step={1} value={maxNewTokens} onChange={(_e, value) => setMaxNewTokens(value)} valueLabelDisplay="auto" />
          </Stack>

          <Stack spacing={1}>
            <Typography gutterBottom>{t('field.topK', { value: topK })}</Typography>
            <Slider min={3} max={20} step={1} value={topK} onChange={(_e, value) => setTopK(value)} valueLabelDisplay="auto" />
          </Stack>

          <Stack spacing={1}>
            <Typography gutterBottom>{t('field.topP', { value: Number(topP).toFixed(2) })}</Typography>
            <Slider min={0.1} max={1} step={0.05} value={topP} onChange={(_e, value) => setTopP(value)} valueLabelDisplay="auto" />
          </Stack>

          <Stack spacing={1}>
            <Typography gutterBottom>{t('field.temperature', { value: Number(temperature).toFixed(2) })}</Typography>
            <Slider min={0.2} max={2} step={0.05} value={temperature} onChange={(_e, value) => setTemperature(value)} valueLabelDisplay="auto" />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={loadingModel ? <CircularProgress size={16} color="inherit" /> : <SmartToyIcon />} label={model.loaded ? t('status.ready', { modelId: model.modelId }) : t('status.modelNotLoaded')} color={model.loaded ? 'success' : 'warning'} variant={model.loaded ? 'filled' : 'outlined'} />
            {model.loadedAt ? <Chip label={t('status.loadedAt', { time: new Date(model.loadedAt).toLocaleTimeString(locale) })} /> : null}
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onLoadModel} disabled={loadingModel || running}>{loadingModel ? t('button.loading') : t('button.reloadModel')}</Button>
            <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onRun} disabled={running || loadingModel || !model.loaded}>{running ? t('button.running') : t('button.run')}</Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="text" onClick={onBack} disabled={activeStep <= 0}>{t('button.previous')}</Button>
            <Button variant="text" onClick={onNext} disabled={activeStep >= maxStep}>{t('button.next')}</Button>
            <Button variant="text" onClick={onReset}>{t('button.reset')}</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
