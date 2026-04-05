import { Card, CardContent, Chip, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import JsonBlock from './JsonBlock';
import { useI18n } from '../i18n/I18nProvider';

function DidacticBlock({ didactic }) {
  const { t } = useI18n();
  if (!didactic) return null;

  const color = didactic.badge.toLowerCase().includes('proxy') ? 'warning' : didactic.badge.toLowerCase().includes('summary') || didactic.badge.toLowerCase().includes('resumo') ? 'info' : 'success';

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">Didática</Typography>
        <Chip label={didactic.badge} color={color} size="small" />
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{t('details.input')}</Typography>
        <Typography color="text.secondary">{didactic.input}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{t('details.transform')}</Typography>
        <Typography color="text.secondary">{didactic.transform}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{t('details.output')}</Typography>
        <Typography color="text.secondary">{didactic.output}</Typography>
      </Stack>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{t('details.why')}</Typography>
        <Typography color="text.secondary">{didactic.why}</Typography>
      </Stack>
      {didactic.caveats?.length ? (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{t('details.caveats')}</Typography>
          <Typography component="div" color="text.secondary">
            <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 18 }}>
              {didactic.caveats.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}

export default function StepDetails({ step, mode = 'technical' }) {
  const { t } = useI18n();
  if (!step) return null;

  const isBeginner = mode === 'beginner';
  let body = !isBeginner ? <JsonBlock value={step.payload} /> : null;

  if (step.id === 'tokenization') {
    body = (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('table.position')}</TableCell>
            <TableCell>{t('table.token')}</TableCell>
            <TableCell>{t('table.id')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {step.payload.tokens.map((token, index) => (
            <TableRow key={`${token}-${index}`}>
              <TableCell>{index}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={step.payload.tokensDisplay?.[index] ?? token} size="small" variant="outlined" />
                  {!isBeginner ? <Typography variant="body2" color="text.secondary">(raw: {token})</Typography> : null}
                </Stack>
              </TableCell>
              <TableCell>{step.payload.ids[index]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (step.id === 'logits' && isBeginner && step.payload.strategyComparison?.length) {
    body = (
      <Stack spacing={1.5}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('table.strategy')}</TableCell>
              <TableCell>{t('table.token')}</TableCell>
              <TableCell>{t('table.probability')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {step.payload.strategyComparison.map((item) => (
              <TableRow key={item.strategy}>
                <TableCell>{t(`strategy.${item.strategy}`)}</TableCell>
                <TableCell>{item.chosenToken}</TableCell>
                <TableCell>{item.probability}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    );
  }

  if (step.id === 'embedding') {
    body = (
      <Stack spacing={2}>
        {step.payload.embeddings.map((item) => (
          <Stack key={`${item.token}-${item.id}`} spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip label={item.tokenDisplay ?? item.token} color="primary" size="small" />
              <Typography variant="body2" color="text.secondary">id {item.id}</Typography>
            </Stack>
            {!isBeginner ? <JsonBlock value={item.values} /> : (
              <Typography color="text.secondary">{t('details.vectorPreview')} <strong>[{item.values.join(', ')}]</strong></Typography>
            )}
          </Stack>
        ))}
      </Stack>
    );
  }

  if (step.id === 'attention') {
    body = step.payload.available ? (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('table.origin')}</TableCell>
            <TableCell>{t('table.focus')}</TableCell>
            <TableCell>{t('table.weight')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {step.payload.attention.map((item) => (
            <TableRow key={`${item.sourceIndex}-${item.targetIndex ?? item.sourceIndex}`}>
              <TableCell>{item.sourceDisplay ?? item.source}</TableCell>
              <TableCell>{step.payload.focusTokenDisplay ?? step.payload.focusToken}</TableCell>
              <TableCell>{item.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <Typography color="text.secondary">{t('details.noAttention')}</Typography>
    );
  }

  if (step.id === 'logits') {
    body = (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('table.token')}</TableCell>
            <TableCell>{t('table.id')}</TableCell>
            <TableCell>{t('table.logit')}</TableCell>
            <TableCell>{t('table.probability')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {step.payload.logits.map((item) => (
            <TableRow key={`${item.token}-${item.tokenId}`}>
              <TableCell>{item.token}</TableCell>
              <TableCell>{item.tokenId}</TableCell>
              <TableCell>{item.logit}</TableCell>
              <TableCell>{item.probability}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (step.id === 'logits' && isBeginner && step.payload.strategyComparison?.length) {
    body = (
      <Stack spacing={1.5}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('table.strategy')}</TableCell>
              <TableCell>{t('table.token')}</TableCell>
              <TableCell>{t('table.probability')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {step.payload.strategyComparison.map((item) => (
              <TableRow key={item.strategy}>
                <TableCell>{t(`strategy.${item.strategy}`)}</TableCell>
                <TableCell>{item.chosenToken}</TableCell>
                <TableCell>{item.probability}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    );
  }

  if (step.id === 'decode') {
    body = (
      <Stack spacing={1.5}>
        <Typography><strong>{t('details.completion')}</strong> {step.payload.completion}</Typography>
        <Typography><strong>{t('details.chosenToken')}</strong> {step.payload.nextToken}</Typography>
        <Typography color="text.secondary">{t('chip.strategy', { value: t(`strategy.${step.payload.decodingStrategy || 'greedy'}`) })}</Typography>
        {!isBeginner ? <JsonBlock value={step.payload.generationSteps} /> : <Typography color="text.secondary">{t('details.decodeHint')}</Typography>}
      </Stack>
    );
  }

  if (step.id === 'residual') {
    body = isBeginner
      ? <Typography color="text.secondary">{t('details.residualPreview')} <strong>[{step.payload.residual.join(', ')}]</strong></Typography>
      : <JsonBlock value={step.payload.residual} />;
  }

  if (step.id === 'prompt' && isBeginner) {
    body = (
      <Stack spacing={1.5}>
        <Typography><strong>{t('details.prompt')}</strong> {step.payload.prompt}</Typography>
        <Typography color="text.secondary">{t('details.beginnerPrompt')}</Typography>
      </Stack>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="h5">{step.label}</Typography>
            <Typography color="text.secondary">{step.description}</Typography>
          </Stack>
          <DidacticBlock didactic={step.didactic} />
          <Divider />
          {body}
        </Stack>
      </CardContent>
    </Card>
  );
}
