
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../i18n/I18nProvider';
import AttentionHeatmap from './AttentionHeatmap';

const palette = ['#7c4dff', '#26c6da', '#ffca28', '#66bb6a', '#ef5350', '#ab47bc', '#5c6bc0', '#ffa726'];

export default function ChartsPanel({ step, generationStep }) {
  const { t } = useI18n();
  if (!step) return null;

  let data = [];
  let chart = null;
  let title = '';

  if (step.id === 'decode') {
    const current = generationStep || (step.payload.generationSteps ? step.payload.generationSteps[0] : null);
    if (current) {
      title = t('charts.strategyCompare');
      chart = (
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{t('player.poolBreakdown')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{t('table.token')}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{t('table.probability')}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{t('table.normalizedProbability')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(current.candidatePool || []).map((item) => (
                  <TableRow key={`${current.step}-pool-${item.tokenId ?? item.index}`} selected={item.token === current.chosenTokenText}>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{item.token}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{item.probability}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{item.normalizedProbability}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{t('player.compare')}</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={current.strategyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" tickFormatter={(value) => t(`strategy.${value}`)} fontSize={10} />
                <YAxis domain={[0, 1]} fontSize={10} />
                <Tooltip formatter={(value) => value} labelFormatter={(value) => t(`strategy.${value}`)} />
                <Bar dataKey="normalizedProbability">
                  {current.strategyComparison.map((entry, index) => <Cell key={`${entry.strategy}-${index}`} fill={palette[index % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      );
    }
  } else if (step.id === 'tokenization') {
    title = t('charts.tokenIds');
    const tokens = step.payload.tokensDisplay ?? step.payload.tokens;
    data = tokens.map((token, index) => ({ token, id: step.payload.ids[index] }));
    chart = (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="token" interval={0} angle={-25} textAnchor="end" height={80} /><YAxis /><Tooltip /><Bar dataKey="id">{data.map((entry, index) => <Cell key={`${entry.token}-${index}`} fill={palette[index % palette.length]} />)}</Bar></BarChart>
      </ResponsiveContainer>
    );
  } else if (step.id === 'attention' && step.payload.available) {
    title = t('charts.attentionFor', { token: step.payload.focusTokenDisplay || step.payload.focusToken });
    data = step.payload.attention.map((item) => ({ token: item.sourceDisplay ?? item.source, weight: item.weight }));
    chart = (
      <Stack spacing={2}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="token" interval={0} angle={-25} textAnchor="end" height={80} /><YAxis domain={[0, 1]} /><Tooltip /><Bar dataKey="weight">{data.map((entry, index) => <Cell key={`${entry.token}-${index}`} fill={palette[index % palette.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        <AttentionHeatmap attention={step.payload} />
      </Stack>
    );
  } else if (step.id === 'residual') {
    title = t('charts.residual');
    data = step.payload.residual.map((value, index) => ({ dim: `d${index}`, value }));
    chart = (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="dim" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#26c6da" strokeWidth={3} dot={false} /></LineChart>
      </ResponsiveContainer>
    );
  } else if (step.id === 'logits') {
    title = t('charts.logits');
    data = step.payload.logits;
    chart = (
      <Stack spacing={2}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 28 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="token" width={120} /><Tooltip /><Bar dataKey="probability">{data.map((entry, index) => <Cell key={`${entry.token}-${index}`} fill={palette[index % palette.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        {step.payload.strategyComparison?.length ? (
          <>
            <Typography variant="h6">{t('charts.strategyCompare')}</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={step.payload.strategyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="strategy" tickFormatter={(value) => t(`strategy.${value}`)} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value) => value} labelFormatter={(value) => t(`strategy.${value}`)} />
                <Bar dataKey="normalizedProbability">
                  {step.payload.strategyComparison.map((entry, index) => <Cell key={`${entry.strategy}-${index}`} fill={palette[index % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : null}
      </Stack>
    );
  }

  if (!chart) {
    return <Card sx={{ height: '100%' }}><CardContent sx={{ p: 2.5 }}><Typography variant="h6" sx={{ mb: 1 }}>{t('charts.title')}</Typography><Typography variant="body2" color="text.secondary">{t('charts.empty')}</Typography></CardContent></Card>;
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <Box sx={{ width: '100%' }}>
          {chart}
        </Box>
      </CardContent>
    </Card>
  );
}
