export type RoseNodeType = 'memory' | 'moment' | 'place' | 'photo' | 'melody' | 'gift' | 'letter' | 'promise';

export type RoseNodeImportance = 'core' | 'major' | 'normal';

export type RoseZone = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  accent: string;
  band: number;
  radius: number;
  description: string;
};

export type RoseNode = {
  id: string;
  title: string;
  zoneId: string;
  type: RoseNodeType;
  importance: RoseNodeImportance;
  date: string;
  location: string;
  description: string;
  tags: string[];
  theta: number;
  bandOffset: number;
  radiusOffset: number;
};
