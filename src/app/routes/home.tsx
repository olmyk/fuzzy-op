import { Box, Button, Card, CardContent, Chip, Container, Divider, Grid, Typography } from '@mui/material';
import { Link } from 'react-router';
import { paths } from '@/config/paths';

// Inline SVG showing overlapping membership functions as a decorative illustration
function MembershipIllustration() {
  const W = 480;
  const H = 140;
  const pad = { l: 16, r: 16, t: 12, b: 24 };
  const w = W - pad.l - pad.r;
  const h = H - pad.t - pad.b;

  function pt(nx: number, ny: number) {
    return `${pad.l + nx * w},${pad.t + (1 - ny) * h}`;
  }

  // Triangle A: 0.0 → 0.35 → 0.65
  const triA = [pt(0, 0), pt(0.02, 0), pt(0.35, 1), pt(0.65, 0), pt(0.67, 0)].join(' ');

  // Triangle B: 0.3 → 0.6 → 0.9
  const triB = [pt(0.3, 0), pt(0.32, 0), pt(0.6, 1), pt(0.88, 0), pt(0.9, 0)].join(' ');

  // Gaussian-ish C: peak at 0.78
  function gauss(nx: number) {
    const c = 0.72; const s = 0.075;
    return Math.exp(-Math.pow(nx - c, 2) / (2 * s * s));
  }
  const gaussPts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const nx = 0.40 + i * (0.60 / 80);
    const ny = gauss(nx);
    if (ny > 0.001) gaussPts.push(pt(nx, ny));
  }
  const gaussLine = gaussPts.join(' ');

  // Axis line
  const axisY = pad.t + h;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${W} ${H}`}
      sx={{ width: '100%', maxWidth: W, display: 'block', mx: 'auto', opacity: 0.92 }}
      aria-hidden="true"
    >
      {/* Dashed µ=1 reference */}
      <line
        x1={pad.l} y1={pad.t} x2={W - pad.r} y2={pad.t}
        stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.25"
      />
      {/* µ label */}
      <text x={pad.l - 4} y={pad.t + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.5">1</text>
      <text x={pad.l - 4} y={axisY} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.5">0</text>
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.45" fontStyle="italic">x</text>

      {/* X axis */}
      <line x1={pad.l} y1={axisY} x2={W - pad.r} y2={axisY} stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

      {/* Triangle A — blue tint */}
      <polyline points={triA} fill="rgba(25,118,210,0.12)" stroke="rgba(25,118,210,0.7)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <text x={pad.l + 0.35 * w} y={pad.t - 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(25,118,210,0.8)">A</text>

      {/* Triangle B — green tint */}
      <polyline points={triB} fill="rgba(46,125,50,0.1)" stroke="rgba(46,125,50,0.65)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <text x={pad.l + 0.6 * w} y={pad.t - 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(46,125,50,0.75)">B</text>

      {/* Gaussian C — orange tint */}
      {gaussPts.length > 1 && (
        <>
          <polyline points={gaussLine} fill="rgba(237,108,2,0.1)" stroke="rgba(237,108,2,0.7)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <text x={pad.l + 0.72 * w} y={pad.t - 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="rgba(237,108,2,0.8)">C</text>
        </>
      )}
    </Box>
  );
}

const FEATURES = [
  {
    title: 'Fuzzy Numbers',
    subtitle: 'Arithmetic on uncertainty',
    description:
      'Define fuzzy numbers by discrete points or standard membership functions (triangle, Gaussian, bell…). Compose addition, subtraction, multiplication, and division expressions via drag-and-drop. Results are computed using alpha-cut interval arithmetic.',
    chips: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
    to: paths.fuzzyNumbers.getHref(),
    color: 'primary' as const,
  },
  {
    title: 'Fuzzy Sets',
    subtitle: 'Set operations with graded membership',
    description:
      'Build fuzzy sets with arbitrary membership functions. Apply union (∪), intersection (∩), and complement (∁) operations. Visualise multiple sets together in overlay graphs.',
    chips: ['Union', 'Intersection', 'Complement'],
    to: paths.fuzzySets.getHref(),
    color: 'success' as const,
  },
];

const CONCEPTS = [
  {
    term: 'Membership function µ(x)',
    definition: 'Maps each element x to a grade in [0, 1] indicating the degree to which x belongs to a fuzzy set.',
  },
  {
    term: 'Alpha-cut [A]α',
    definition: 'The crisp set of all elements whose membership is at least α. Used to compute arithmetic results exactly for piecewise-linear numbers.',
  },
  {
    term: 'Normal fuzzy number',
    definition: 'A convex (unimodal) fuzzy set where at least one element has membership µ = 1.',
  },
];

const HomeRoute = () => (
  <Box>
    {/* Hero */}
    <Box
      sx={{
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'linear-gradient(160deg, #0d2137 0%, #0a3d2e 100%)'
            : 'linear-gradient(160deg, #e3f0fb 0%, #e8f5e9 100%)',
        py: { xs: 6, md: 8 },
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="md">
        <Chip label="Interactive Explorer" size="small" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15, mb: 1.5 }}
        >
          Fuzzy Logic&nbsp;
          <Box component="span" sx={{ color: 'primary.main' }}>Operations</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 560, mb: 4 }}>
          Explore arithmetic on fuzzy numbers and set operations with graded membership — interactively, step by step.
        </Typography>

        <MembershipIllustration />

        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to={paths.fuzzyNumbers.getHref()}
            variant="contained"
            size="large"
            sx={{ fontWeight: 700, px: 3 }}
          >
            Fuzzy Numbers →
          </Button>
          <Button
            component={Link}
            to={paths.fuzzySets.getHref()}
            variant="outlined"
            size="large"
            color="success"
            sx={{ fontWeight: 700, px: 3 }}
          >
            Fuzzy Sets →
          </Button>
        </Box>
      </Container>
    </Box>

    {/* Feature cards */}
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
      <Grid container spacing={3}>
        {FEATURES.map((f) => (
          <Grid key={f.title} size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="overline" color={`${f.color}.main`} sx={{ fontWeight: 700, letterSpacing: 1.2 }}>
                  {f.subtitle}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 1.5 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                  {f.description}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                    {f.chips.map((c) => (
                      <Chip key={c} label={c} size="small" color={f.color} variant="outlined" />
                    ))}
                  </Box>
                  <Button
                    component={Link}
                    to={f.to}
                    variant="contained"
                    color={f.color}
                    sx={{ fontWeight: 700 }}
                  >
                    Open
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>

    <Divider />

    {/* Key concepts */}
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 6 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Key concepts
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {CONCEPTS.map((c) => (
          <Box key={c.term} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                flexShrink: 0,
                mt: '7px',
              }}
            />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {c.term}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {c.definition}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

export default HomeRoute;
