import type { Advertisement } from '../../../../types/advertisement.types';
import { AdCard } from '../AdCard/AdCard';
import './AdsGrid.css';

type AdsGridProps = {
  ads: Advertisement[];
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
};

/**
 * @description Card-grid listing of ads, one AdCard each.
 */
export const AdsGrid = ({ ads, onEdit, onDelete }: AdsGridProps) => (
  <div className="ads-grid">
    {ads.map((ad) => (
      <AdCard key={ad.id} ad={ad} onEdit={onEdit} onDelete={onDelete} />
    ))}
  </div>
);
