import { Box, Step, StepButton, Stepper } from '@mui/material';
import { useI18n } from '../i18n/I18nProvider';

export default function InferenceStepper({ steps, activeStep, onStepChange }) {
  const { t } = useI18n();

  return (
    <Box>
      <Stepper activeStep={activeStep} nonLinear alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.id} completed={index < activeStep}>
            <StepButton
              color="inherit"
              onClick={() => onStepChange(index)}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  fontWeight: index === activeStep ? 700 : 400,
                },
              }}
            >
              {step.label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
