import { Fragment } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useI18n } from '../i18n/I18nProvider';

function cellColor(value, active = false) {
  const alpha = Math.max(0.06, Math.min(Number(value || 0), 1));
  return active ? `rgba(124,77,255,${Math.max(alpha, 0.35)})` : `rgba(38,198,218,${alpha})`;
}

export default function AttentionHeatmap({ attention }) {
  const { t } = useI18n();
  if (!attention?.available || !attention?.matrix?.length) return null;

  const labels = attention.tokensDisplay || [];
  const matrix = attention.matrix || [];

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">{t('heatmap.title')}</Typography>
      <Typography variant="body2" color="text.secondary">{t('heatmap.subtitle')}</Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `140px repeat(${labels.length}, minmax(44px, 1fr))`,
            gap: 0.75,
            minWidth: 200 + labels.length * 48,
            alignItems: 'center',
          }}
        >
          <Box />
          {labels.map((label, index) => (
            <Box
              key={`col-${index}`}
              sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={label}
            >
              {label}
            </Box>
          ))}

          {matrix.map((row, rowIndex) => (
            <Fragment key={`row-${rowIndex}`}>
              <Box
                key={`row-label-${rowIndex}`}
                sx={{ fontSize: 11, color: rowIndex === attention.focusIndex ? 'primary.main' : 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={labels[rowIndex]}
              >
                {labels[rowIndex]}
              </Box>
              {row.map((value, colIndex) => (
                <Box
                  key={`cell-${rowIndex}-${colIndex}`}
                  title={`${labels[rowIndex]} → ${labels[colIndex]} = ${value}`}
                  sx={{ height: 34, borderRadius: 1.5, bgcolor: cellColor(value, rowIndex === attention.focusIndex), border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
                >
                  {Number(value).toFixed(2)}
                </Box>
              ))}
            </Fragment>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
