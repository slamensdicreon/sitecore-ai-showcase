import HeroBanner from 'src/components/hero-banner/HeroBanner';
import MegaTrends from 'src/components/mega-trends/MegaTrends';
import SolutionPathways from 'src/components/solution-pathways/SolutionPathways';
import AuthorityStats from 'src/components/authority-stats/AuthorityStats';
import SolutionHero from 'src/components/solution-hero/SolutionHero';
import SolutionNarrative from 'src/components/solution-narrative/SolutionNarrative';
import ProductDiscovery from 'src/components/product-discovery/ProductDiscovery';
import ProofPointCounter from 'src/components/proof-point-counter/ProofPointCounter';
import CrossNavigation from 'src/components/cross-navigation/CrossNavigation';
import RichTextBlock from 'src/components/rich-text-block/RichTextBlock';
import Container from 'src/components/sxa/Container';
import ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import ContentBlock from 'src/components/sxa/ContentBlock';

export const componentMap: Record<string, any> = {
  HeroBanner,
  MegaTrends,
  SolutionPathways,
  AuthorityStats,
  SolutionHero,
  SolutionNarrative,
  ProductDiscovery,
  ProofPointCounter,
  CrossNavigation,
  RichTextBlock,
  Container,
  ColumnSplitter,
  ContentBlock,
};

export default componentMap;
