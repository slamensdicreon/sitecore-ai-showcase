import { combineImportEntries, defaultImportEntries } from '@sitecore-content-sdk/nextjs/codegen';
import HeroBanner from 'src/components/hero-banner/HeroBanner';
import MegaTrends from 'src/components/mega-trends/MegaTrends';
import MegaTrendCard from 'src/components/mega-trend-card/MegaTrendCard';
import SolutionPathways from 'src/components/solution-pathways/SolutionPathways';
import SolutionPathwayCard from 'src/components/solution-pathway-card/SolutionPathwayCard';
import AuthorityStats from 'src/components/authority-stats/AuthorityStats';
import StatItem from 'src/components/stat-item/StatItem';
import SolutionHero from 'src/components/solution-hero/SolutionHero';
import SolutionNarrative from 'src/components/solution-narrative/SolutionNarrative';
import ChallengeCard from 'src/components/challenge-card/ChallengeCard';
import ProductDiscovery from 'src/components/product-discovery/ProductDiscovery';
import ProofPointCounter from 'src/components/proof-point-counter/ProofPointCounter';
import ProofPointItem from 'src/components/proof-point-item/ProofPointItem';
import CrossNavigation from 'src/components/cross-navigation/CrossNavigation';
import CrossNavLink from 'src/components/cross-nav-link/CrossNavLink';
import RichTextBlock from 'src/components/rich-text-block/RichTextBlock';
import Container from 'src/components/sxa/Container';
import ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import ContentBlock from 'src/components/sxa/ContentBlock';

const entries = combineImportEntries(defaultImportEntries, {
  HeroBanner,
  MegaTrends,
  MegaTrendCard,
  SolutionPathways,
  SolutionPathwayCard,
  AuthorityStats,
  StatItem,
  SolutionHero,
  SolutionNarrative,
  ChallengeCard,
  ProductDiscovery,
  ProofPointCounter,
  ProofPointItem,
  CrossNavigation,
  CrossNavLink,
  RichTextBlock,
  Container,
  ColumnSplitter,
  ContentBlock,
});

export default entries;
