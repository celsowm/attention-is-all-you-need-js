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
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800 }}>
          attention-is-all-you-need-js
        </Typography>
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Chip size="small" icon={<AutoAwesomeIcon />} label={t('hero.kicker1')} variant="outlined" />
          <Chip size="small" icon={<BoltIcon />} label={t('hero.kicker2')} variant="outlined" />
          <Chip size="small" icon={<HubIcon />} label={model.loaded ? t('hero.activeModel', { modelId: model.modelId }) : t('hero.loadingModel')} color="primary" />
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: 600, textAlign: 'right' }}>
        {t('hero.subtitle')}
      </Typography>
    </Box>
  );
}
