import { Dialog, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';
import { getGlossary } from '../content/glossary';
import { useI18n } from '../i18n/I18nProvider';

export default function GlossaryDialog({ open, onClose }) {
  const { locale, t } = useI18n();
  const terms = getGlossary(locale);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('glossary.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ py: 1 }}>
          {terms.map((item) => (
            <Stack key={item.term} spacing={0.75}>
              <Typography variant="h6">{item.term}</Typography>
              <Typography color="text.secondary">{item.short}</Typography>
              <Typography variant="body2" color="text.secondary">{item.detail}</Typography>
              <Divider sx={{ mt: 1 }} />
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
