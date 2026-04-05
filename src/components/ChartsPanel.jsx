
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../i18n/I18nProvider';
import AttentionHeatmap from './AttentionHeatmap';

const palette = ['#7c4dff', '#26c6da', '#ffca28', '#66bb6a', '#ef5350', '#ab47bc', '#5c6bc0', '#ffa726'];

export default function ChartsPanel({ step }) {
  const { t } = useI18n();
  if (!step) return null;

  let data = [];
  let chart = null;
  let title = '';

  if (step.id === 'tokenization') {
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
    return <Card sx={{ height: '100%' }}><CardContent><Typography variant="h5" sx={{ mb: 1.5 }}>{t('charts.title')}</Typography><Typography color="text.secondary">{t('charts.empty')}</Typography></CardContent></Card>;
  }

  return <Card sx={{ height: '100%' }}><CardContent><Typography variant="h5" sx={{ mb: 1.5 }}>{title}</Typography>{chart}</CardContent></Card>;
}
