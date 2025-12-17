'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/material/styles';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import Header from '@/components/header/Header';

const knowledgeHubLinks = [
  {
    text: 'CMHC-SCHL: National Housing Strategy',
    url: 'https://www.cmhc-schl.gc.ca/nhs',
  },
  {
    text: 'CITY of Toronto: Open Calls for Affordable Housing Initiatives',
    url: 'https://www.toronto.ca/community-people/community-partners/housing-partners/open-requests-for-proposals/',
  },
  {
    text: 'Community Housing Transformation Centre: Social Purpose Real Estate Resources',
    url: 'https://centre.support/resources/spre-resources/',
  },
  {
    text: 'Federal/Provincial/Territorial housing agreements',
    url: 'https://www.cmhc-schl.gc.ca/nhs/federal-provincial-territorial-housing-agreements',
  },
  {
    text: 'Social Purpose Real Estate: development essentials (visioning, approvals, financial modeling, and site acquisition)',
    url: 'https://infrastructureinstitute.ca/spre-101-videos/',
  },
  {
    text: 'Building successful collaborations for social purpose real estate - Strategy, Finance and Partnership for NPOs: organizational readiness, board buy-in, acquisition routes, finance',
    url: 'https://infrastructureinstitute.ca/spre-webinars/',
  },
  {
    text: 'Organizational Readiness Program',
    url: 'https://infrastructureinstitute.ca/organizational-readiness/',
  },
  {
    text: 'Social Purpose Real Estate Accelerator Program',
    url: 'https://infrastructureinstitute.ca/national-accelerator/',
  },
  {
    text: 'Creative Mixed-Use Case Studies',
    url: 'https://infrastructureinstitute.ca/creative-mixed-use-case-studies/',
  },
];

export default function KnowledgeHubPage() {
  const t = useTranslations('KnowledgeHub');

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={4}>
          {/* Page Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={900}
              gutterBottom
              sx={{
                background: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto' }}>
              {t('description')}
            </Typography>
          </Box>

          {/* Links List */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <List disablePadding>
              {knowledgeHubLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        py: 2.5,
                        px: 3,
                        transition: 'all 200ms ease',
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          pl: 4,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <LinkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.text}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      />
                      <OpenInNewIcon
                        sx={{
                          ml: 1,
                          fontSize: 20,
                          color: 'text.secondary',
                          opacity: 0.6,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < knowledgeHubLinks.length - 1 && (
                    <Box
                      component="li"
                      sx={{
                        height: 1,
                        bgcolor: (theme) => alpha(theme.palette.divider, 0.6),
                        mx: 3,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Footer Note */}
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
            {t('footer')}
          </Typography>
        </Stack>
      </Container>
    </>
  );
}
