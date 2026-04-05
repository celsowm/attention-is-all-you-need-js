import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import HubIcon from '@mui/icons-material/Hub';
import MemoryIcon from '@mui/icons-material/Memory';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useI18n } from '../i18n/I18nProvider';

export default function HeroHeader({ model }) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 6,
        background:
          'radial-gradient(circle at top right, rgba(124,77,255,0.24), transparent 35%), linear-gradient(135deg, rgba(38,198,218,0.18), rgba(124,77,255,0.08))',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip icon={<AutoAwesomeIcon />} label={t('hero.kicker1')} color="primary" />
          <Chip icon={<BoltIcon />} label={t('hero.kicker2')} color="secondary" />
          <Chip icon={<MemoryIcon />} label={t('hero.kicker3')} variant="outlined" />
          <Chip icon={<HubIcon />} label={model.loaded ? t('hero.activeModel', { modelId: model.modelId }) : t('hero.loadingModel')} variant="outlined" />
        </Stack>
        <Typography variant="h3">{t('app.title')}</Typography>
        <Typography color="text.secondary" maxWidth={900}>{t('hero.subtitle')}</Typography>
      </Stack>
    </Box>
  );
}
