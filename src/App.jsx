
import ScienceIcon from '@mui/icons-material/Science';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TokenIcon from '@mui/icons-material/Token';
import TimerIcon from '@mui/icons-material/Timer';
import TagIcon from '@mui/icons-material/Tag';
import { Alert, Box, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ChartsPanel from './components/ChartsPanel';
import GenerationPlayer from './components/GenerationPlayer';
import GlossaryDialog from './components/GlossaryDialog';
import HeroHeader from './components/HeroHeader';
import InferenceStepper from './components/InferenceStepper';
import PromptPanel from './components/PromptPanel';
import StepDetails from './components/StepDetails';
import TokenScene from './components/TokenScene';
import { useInferenceTrace } from './hooks/useInferenceTrace';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { localizeSteps } from './services/tracePresentation';

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AppContent({ traceState }) {
  const [mode, setMode] = useState('beginner');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [selectedGenerationStep, setSelectedGenerationStep] = useState(0);
  const { locale, localePreference, setLocalePreference, promptLocale, getLanguageLabel, t } = useI18n();

  const {
    prompt, setPrompt, maxNewTokens, setMaxNewTokens, topK, setTopK, topP, setTopP, temperature, setTemperature, seed, setSeed,
    decodingStrategy, setDecodingStrategy, activeStep, setActiveStep, trace, model, loadingModel, running, error,
    goNext, goBack, reset, ensureModelLoaded, runInference,
  } = traceState;

  useEffect(() => {
    setSelectedGenerationStep(0);
  }, [trace]);

  const localizedSteps = useMemo(() => localizeSteps(trace.steps, t, locale), [trace.steps, t, locale]);
  const localizedCurrentStep = localizedSteps?.[activeStep] ?? localizedSteps?.[0] ?? null;
  const generationStep = trace.generationSteps?.[selectedGenerationStep] ?? trace.generationSteps?.[0] ?? null;

  const sceneInfo = useMemo(() => {
    const step = localizedCurrentStep;
    if (step?.id === 'decode' && generationStep) {
      return { focusIndex: generationStep.focusIndex, attention: generationStep.attention?.attention ?? null, tokens: generationStep.tokens, tokensDisplay: generationStep.tokensDisplay };
    }
    const tokens = trace.tokens ?? [];
    const tokensDisplay = trace.tokensDisplay ?? [];
    if (step?.id === 'attention' && step.payload?.available) {
      return { focusIndex: step.payload.focusIndex, attention: step.payload.attention, tokens, tokensDisplay };
    }
    return { focusIndex: tokens.length ? tokens.length - 1 : 0, attention: null, tokens, tokensDisplay };
  }, [localizedCurrentStep, trace, generationStep]);

  const activeTokenText = localizedCurrentStep?.id === 'decode'
    ? generationStep?.focusToken ?? generationStep?.tokens?.at(-1) ?? '—'
    : localizedCurrentStep?.payload?.focusToken ?? trace.tokens?.at(-1) ?? '—';

  const onExportTrace = () => {
    downloadJson('trace.json', { exportedAt: new Date().toISOString(), locale, model, trace });
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <HeroHeader model={model} />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <PromptPanel
                prompt={prompt}
                setPrompt={setPrompt}
                maxNewTokens={maxNewTokens}
                setMaxNewTokens={setMaxNewTokens}
                topK={topK}
                setTopK={setTopK}
                topP={topP}
                setTopP={setTopP}
                temperature={temperature}
                setTemperature={setTemperature}
                seed={seed}
                setSeed={setSeed}
                decodingStrategy={decodingStrategy}
                setDecodingStrategy={setDecodingStrategy}
                running={running}
                loadingModel={loadingModel}
                model={model}
                onLoadModel={() => ensureModelLoaded(locale)}
                onRun={() => runInference(locale)}
                onNext={goNext}
                onBack={goBack}
                onReset={reset}
                activeStep={activeStep}
                maxStep={(localizedSteps?.length || 1) - 1}
                mode={mode}
                setMode={setMode}
                onOpenGlossary={() => setGlossaryOpen(true)}
                onExportTrace={onExportTrace}
                traceAvailable={(trace.steps?.length || 0) > 1}
                localePreference={localePreference}
                setLocalePreference={setLocalePreference}
                promptLocale={promptLocale}
                getLanguageLabel={getLanguageLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <InferenceStepper steps={localizedSteps} activeStep={activeStep} onStepChange={setActiveStep} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<SmartToyIcon />} label={t('chip.model', { modelId: model.modelId })} color="primary" />
            <Chip icon={<TokenIcon />} label={t('chip.tokens', { value: trace.tokensDisplay?.join(' • ') || trace.tokens?.join(' • ') || '—' })} variant="outlined" />
            <Chip icon={<ScienceIcon />} label={t('chip.nextToken', { value: trace.nextToken || '—' })} color="secondary" variant="outlined" />
            <Chip icon={<TagIcon />} label={t('chip.seed', { value: trace.decoding?.seed || seed })} variant="outlined" />
            <Chip icon={<TimerIcon />} label={t('chip.timing', { value: trace.metrics?.averageStepMs || 0 })} variant="outlined" />
            <Chip label={t('chip.strategy', { value: t(`strategy.${trace.decoding?.strategy || decodingStrategy}`) })} variant="outlined" />
            <Chip label={t('chip.finalText', { value: trace.finalText || '—' })} variant="outlined" />
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, xl: 5 }}>
              <StepDetails step={localizedCurrentStep} mode={mode} />
            </Grid>
            <Grid size={{ xs: 12, xl: 7 }}>
              <ChartsPanel step={localizedCurrentStep} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <TokenScene tokens={sceneInfo.tokens} tokensDisplay={sceneInfo.tokensDisplay} focusIndex={sceneInfo.focusIndex} attention={sceneInfo.attention} />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ p: 3, borderRadius: 6, height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Stack spacing={2}>
                  <Typography variant="h5">{t('guide.title')}</Typography>
                  <Typography color="text.secondary">{t('guide.body')}</Typography>
                  <Typography component="div" color="text.secondary">
                    {t('guide.observe')}
                    <ul>
                      <li>{t('guide.item1')}</li>
                      <li>{t('guide.item2')}</li>
                      <li>{t('guide.item3')}</li>
                    </ul>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{t('guide.focus', { token: activeTokenText })}</Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          <GenerationPlayer generationSteps={trace.generationSteps} selectedStep={selectedGenerationStep} onStepChange={setSelectedGenerationStep} />
          <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
        </Stack>
      </Container>
    </Box>
  );
}

export default function App() {
  const traceState = useInferenceTrace();
  return (
    <I18nProvider prompt={traceState.prompt}>
      <AppContent traceState={traceState} />
    </I18nProvider>
  );
}
