
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <HeroHeader model={model} />

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 340,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
            bgcolor: 'background.default',
            p: 2,
            display: { xs: 'none', lg: 'block' },
          }}
        >
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
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: '#020617' }}>
          {/* Top Bar for Stepper and Status */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack spacing={2}>
              <InferenceStepper steps={localizedSteps} activeStep={activeStep} onStepChange={setActiveStep} />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip size="small" icon={<SmartToyIcon />} label={t('chip.model', { modelId: model.modelId.split('/').pop() })} color="primary" />
                <Chip size="small" icon={<TokenIcon />} label={t('chip.tokens', { value: trace.tokensDisplay?.join(' • ') || trace.tokens?.join(' • ') || '—' })} variant="outlined" />
                <Chip size="small" icon={<ScienceIcon />} label={t('chip.nextToken', { value: trace.nextToken || '—' })} color="secondary" variant="outlined" />
                <Chip size="small" icon={<TimerIcon />} label={t('chip.timing', { value: trace.metrics?.averageStepMs || 0 })} variant="outlined" />
                <Chip size="small" label={t('chip.strategy', { value: t(`strategy.${trace.decoding?.strategy || decodingStrategy}`) })} variant="outlined" />
              </Stack>
            </Stack>
          </Box>

          {/* Grid Layout for Details, Charts, and Scene */}
          <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid size={{ xs: 12, xl: 4 }} sx={{ height: '100%' }}>
                <Box sx={{ height: '100%', overflowY: 'auto' }}>
                  <StepDetails step={localizedCurrentStep} generationStep={generationStep} mode={mode} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, xl: 4 }} sx={{ height: '100%' }}>
                <Box sx={{ height: '100%', overflowY: 'auto' }}>
                  <ChartsPanel step={localizedCurrentStep} generationStep={generationStep} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, xl: 4 }} sx={{ height: '100%' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <TokenScene tokens={sceneInfo.tokens} tokensDisplay={sceneInfo.tokensDisplay} focusIndex={sceneInfo.focusIndex} attention={sceneInfo.attention} />
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography variant="subtitle2" gutterBottom>{t('guide.title')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('guide.body')}</Typography>
                    <Typography variant="caption" color="primary.main">{t('guide.focus', { token: activeTokenText })}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Footer for Player */}
          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', bgcolor: 'background.paper' }}>
            <GenerationPlayer generationSteps={trace.generationSteps} selectedStep={selectedGenerationStep} onStepChange={setSelectedGenerationStep} />
          </Box>
        </Box>
      </Box>

      <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
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
