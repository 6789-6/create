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
  type: 'memory' | 'moment' | 'place' | 'photo' | 'melody' | 'gift' | 'letter' | 'promise';
  importance: 'core' | 'major' | 'normal';
  date: string;
  location: string;
  description: string;
  tags: string[];
  theta: number;
  bandOffset: number;
  radiusOffset: number;
};

export const roseZones: RoseZone[] = [
  {
    id: 'first-date',
    title: 'First Date',
    subtitle: '初见星环',
    icon: '♡',
    color: '#ffd1e5',
    accent: '#ff6da8',
    band: 0.34,
    radius: 1.42,
    description: '第一次见面、第一次靠近、第一段发光的记忆。'
  },
  {
    id: 'city-lights',
    title: 'City Lights',
    subtitle: '城市灯海',
    icon: '✦',
    color: '#ffc2d8',
    accent: '#ff8bbd',
    band: 0.1,
    radius: 1.56,
    description: '夜景、街角、咖啡馆、晚风和人群里的两个人。'
  },
  {
    id: 'moon-river',
    title: 'Moon River',
    subtitle: '月光河岸',
    icon: '☾',
    color: '#ffe6f0',
    accent: '#ffd4ea',
    band: -0.12,
    radius: 1.48,
    description: '月亮、河边、安静散步和不需要解释的陪伴。'
  },
  {
    id: 'letters',
    title: 'Letters',
    subtitle: '心动来信',
    icon: '✉',
    color: '#ffb9d4',
    accent: '#ff5f9d',
    band: 0.58,
    radius: 1.34,
    description: '文字、留言、未说出口的话和被保存下来的句子。'
  },
  {
    id: 'melodies',
    title: 'Melodies',
    subtitle: '旋律星尘',
    icon: '♪',
    color: '#d9b4ff',
    accent: '#b779ff',
    band: -0.36,
    radius: 1.52,
    description: '歌、声音、耳机里的片段和共同循环过的旋律。'
  },
  {
    id: 'surprises',
    title: 'Surprises',
    subtitle: '惊喜玫瑰',
    icon: '✧',
    color: '#ffdfb6',
    accent: '#ffb46d',
    band: -0.58,
    radius: 1.4,
    description: '礼物、突然出现、计划之外的浪漫和小小仪式感。'
  },
  {
    id: 'promises',
    title: 'Promises',
    subtitle: '誓约轨道',
    icon: '∞',
    color: '#fff1d1',
    accent: '#ffd28a',
    band: 0.72,
    radius: 1.3,
    description: '未来、确定、长久、一起抵达的方向。'
  }
];

const nodeSeeds: Record<string, Omit<RoseNode, 'id' | 'zoneId' | 'theta' | 'bandOffset' | 'radiusOffset'>[]> = {
  'first-date': [
    { title: 'First Date', type: 'memory', importance: 'core', date: 'Apr 14, 2023', location: 'Riverside Café', description: '那天的紧张、笑声和突然安静下来的眼神，像一颗最亮的玫瑰星。', tags: ['Memorable', 'Dinner', 'City Lights'] },
    { title: 'First Smile', type: 'moment', importance: 'major', date: 'Apr 14, 2023', location: 'Window Seat', description: '第一次真正笑出来的时候，整个场景都像被粉色光雾包住。', tags: ['Smile', 'Soft Light'] },
    { title: 'Nearer', type: 'moment', importance: 'normal', date: 'Apr 16, 2023', location: 'Old Street', description: '不知不觉走得更近，步伐和心跳都慢慢同步。', tags: ['Walk', 'Spring'] },
    { title: 'First Photo', type: 'photo', importance: 'normal', date: 'Apr 18, 2023', location: 'Bridge Corner', description: '第一张照片不算完美，但它保存了最自然的瞬间。', tags: ['Photo', 'Bridge'] },
    { title: 'Unexpected Call', type: 'moment', importance: 'normal', date: 'Apr 21, 2023', location: 'Night Room', description: '一次没有计划的通话，把夜晚拉得很长。', tags: ['Call', 'Night'] },
    { title: 'Pink Receipt', type: 'memory', importance: 'normal', date: 'Apr 22, 2023', location: 'Book Café', description: '被夹在书里的小票，后来变成了最小的一颗星。', tags: ['Tiny', 'Keepsake'] },
    { title: 'Slow Goodbye', type: 'moment', importance: 'normal', date: 'Apr 23, 2023', location: 'Station Exit', description: '告别被拖得很慢，因为谁都不想先转身。', tags: ['Goodbye', 'Station'] },
    { title: 'Rose Signal', type: 'memory', importance: 'major', date: 'Apr 28, 2023', location: 'Flower Shop', description: '第一朵玫瑰不是盛大告白，而是悄悄亮起的信号。', tags: ['Rose', 'Signal'] }
  ],
  'city-lights': [
    { title: 'Neon Heart', type: 'place', importance: 'major', date: 'May 02, 2023', location: 'East Avenue', description: '路边的粉色霓虹灯像临时出现的心形坐标。', tags: ['Neon', 'Heart'] },
    { title: 'Rooftop Wind', type: 'place', importance: 'normal', date: 'May 08, 2023', location: 'Rooftop', description: '风从高处经过，城市在脚下闪烁。', tags: ['Rooftop', 'Wind'] },
    { title: 'Late Movie', type: 'moment', importance: 'normal', date: 'May 13, 2023', location: 'Cinema 7', description: '电影散场以后，最难忘的反而是走出来那段路。', tags: ['Movie', 'Night'] },
    { title: 'Rain Taxi', type: 'place', importance: 'normal', date: 'May 18, 2023', location: 'Taxi Window', description: '车窗上的雨痕把城市灯光拉成了玫瑰色。', tags: ['Rain', 'Taxi'] },
    { title: 'Corner Bakery', type: 'place', importance: 'normal', date: 'May 22, 2023', location: 'Bakery', description: '面包店的暖光和刚好递过来的纸袋。', tags: ['Warm', 'Street'] },
    { title: 'City Walk', type: 'memory', importance: 'normal', date: 'May 26, 2023', location: 'Downtown', description: '没有目的的散步，反而保存了最多画面。', tags: ['Walk', 'Lights'] },
    { title: 'Night Bridge', type: 'place', importance: 'normal', date: 'Jun 01, 2023', location: 'River Bridge', description: '桥上的灯一盏盏亮起，像星云里的轨道。', tags: ['Bridge', 'River'] },
    { title: 'City Promise', type: 'promise', importance: 'major', date: 'Jun 08, 2023', location: 'Observation Deck', description: '在城市最高处说出一个很轻、但很确定的未来。', tags: ['Promise', 'Skyline'] }
  ],
  'moon-river': [
    { title: 'Moon Walk', type: 'memory', importance: 'major', date: 'Jun 16, 2023', location: 'Riverside', description: '月亮在水面上碎开，像一条安静发光的路。', tags: ['Moon', 'River'] },
    { title: 'Silver Bench', type: 'place', importance: 'normal', date: 'Jun 17, 2023', location: 'Bench 03', description: '坐了很久，谁都没有急着离开。', tags: ['Bench', 'Quiet'] },
    { title: 'Hand Shadow', type: 'moment', importance: 'normal', date: 'Jun 20, 2023', location: 'Lamp Post', description: '影子先靠近，然后手才靠近。', tags: ['Shadow', 'Hand'] },
    { title: 'Blue Silence', type: 'moment', importance: 'normal', date: 'Jun 24, 2023', location: 'Riverbank', description: '沉默并不尴尬，像蓝色的保护层。', tags: ['Quiet', 'Blue'] },
    { title: 'Floating Wish', type: 'promise', importance: 'normal', date: 'Jul 02, 2023', location: 'Waterfront', description: '把愿望说得很小，像怕惊动月光。', tags: ['Wish', 'Moonlight'] },
    { title: 'Long Way Home', type: 'place', importance: 'normal', date: 'Jul 05, 2023', location: 'South Path', description: '回家的路绕远了，却刚好变成一段记忆。', tags: ['Home', 'Path'] },
    { title: 'Water Reflection', type: 'photo', importance: 'normal', date: 'Jul 07, 2023', location: 'River Steps', description: '水面的倒影比照片更像梦。', tags: ['Reflection', 'Photo'] },
    { title: 'Moonlit Answer', type: 'letter', importance: 'major', date: 'Jul 11, 2023', location: 'Riverside', description: '有些答案没有声音，只在那晚被看见。', tags: ['Answer', 'Moon'] }
  ],
  letters: [
    { title: 'Unsent Letter', type: 'letter', importance: 'core', date: 'Jul 18, 2023', location: 'Draft Box', description: '没有发出去的文字，后来成为星云深处最亮的私语。', tags: ['Letter', 'Secret'] },
    { title: 'Good Morning', type: 'letter', importance: 'normal', date: 'Jul 20, 2023', location: 'Chat', description: '每天早上的第一句话，像固定升起的小太阳。', tags: ['Morning', 'Message'] },
    { title: 'Midnight Text', type: 'letter', importance: 'normal', date: 'Jul 26, 2023', location: 'Phone', description: '零点后的消息，总比白天更接近心里。', tags: ['Night', 'Text'] },
    { title: 'Paper Rose', type: 'letter', importance: 'major', date: 'Aug 01, 2023', location: 'Notebook', description: '一张纸被折成玫瑰，像一句没有说完的话。', tags: ['Paper', 'Rose'] },
    { title: 'Tiny Note', type: 'letter', importance: 'normal', date: 'Aug 06, 2023', location: 'Book Page', description: '夹在书页里的便签，轻得像花瓣。', tags: ['Note', 'Book'] },
    { title: 'Voice Memo', type: 'letter', importance: 'normal', date: 'Aug 10, 2023', location: 'Recorder', description: '声音比文字更柔软，也更容易被保存。', tags: ['Voice', 'Memo'] },
    { title: 'Last Page', type: 'letter', importance: 'normal', date: 'Aug 14, 2023', location: 'Diary', description: '最后一页没有结尾，只留下继续写下去的空白。', tags: ['Diary', 'Future'] },
    { title: 'Pink Envelope', type: 'letter', importance: 'major', date: 'Aug 22, 2023', location: 'Drawer', description: '信封被打开时，里面像藏着一小片星空。', tags: ['Envelope', 'Stardust'] }
  ],
  melodies: [
    { title: 'Our Song', type: 'melody', importance: 'core', date: 'Sep 03, 2023', location: 'Headphones', description: '循环播放的那首歌，像玫瑰星云的背景心跳。', tags: ['Song', 'Loop'] },
    { title: 'Kitchen Waltz', type: 'melody', importance: 'normal', date: 'Sep 08, 2023', location: 'Kitchen', description: '洗杯子的声音和随手哼出的旋律。', tags: ['Waltz', 'Home'] },
    { title: 'Bus Window', type: 'melody', importance: 'normal', date: 'Sep 12, 2023', location: 'Bus Line 9', description: '耳机里的歌和窗外退后的灯。', tags: ['Bus', 'Window'] },
    { title: 'Rain Playlist', type: 'melody', importance: 'normal', date: 'Sep 18, 2023', location: 'Rainy Room', description: '雨天的歌总是更像一封信。', tags: ['Rain', 'Playlist'] },
    { title: 'Humming Light', type: 'melody', importance: 'normal', date: 'Sep 21, 2023', location: 'Bedroom', description: '轻轻哼唱的时候，灯光也变得更慢。', tags: ['Humming', 'Light'] },
    { title: 'Record Shop', type: 'melody', importance: 'normal', date: 'Sep 26, 2023', location: 'Vinyl Store', description: '在唱片架之间发现同一首喜欢的歌。', tags: ['Vinyl', 'Shop'] },
    { title: 'Piano Room', type: 'melody', importance: 'major', date: 'Oct 01, 2023', location: 'Small Hall', description: '琴声落下来时，整个空间像透明的玫瑰。', tags: ['Piano', 'Memory'] },
    { title: 'Ending Theme', type: 'melody', importance: 'normal', date: 'Oct 05, 2023', location: 'Cinema Exit', description: '片尾曲响起时，谁都没有急着起身。', tags: ['Cinema', 'Theme'] }
  ],
  surprises: [
    { title: 'Hidden Gift', type: 'gift', importance: 'major', date: 'Oct 12, 2023', location: 'Desk Corner', description: '礼物藏得并不深，但惊喜刚刚好。', tags: ['Gift', 'Secret'] },
    { title: 'Rose Delivery', type: 'gift', importance: 'core', date: 'Oct 18, 2023', location: 'Front Door', description: '门铃响起，玫瑰从现实里进入了星云。', tags: ['Rose', 'Surprise'] },
    { title: 'Small Cake', type: 'gift', importance: 'normal', date: 'Oct 21, 2023', location: 'Corner Table', description: '蜡烛很小，但愿望被照得很亮。', tags: ['Cake', 'Wish'] },
    { title: 'Ticket Stub', type: 'gift', importance: 'normal', date: 'Oct 25, 2023', location: 'Theater', description: '票根被收好，像被宇宙盖了一枚章。', tags: ['Ticket', 'Theater'] },
    { title: 'Warm Scarf', type: 'gift', importance: 'normal', date: 'Nov 02, 2023', location: 'Winter Street', description: '围巾绕上的那一刻，冬天也变得没那么冷。', tags: ['Scarf', 'Winter'] },
    { title: 'Secret Route', type: 'place', importance: 'normal', date: 'Nov 07, 2023', location: 'Unknown Path', description: '被提前计划好的路线，通向没有预告的风景。', tags: ['Route', 'Plan'] },
    { title: 'Window Flowers', type: 'gift', importance: 'normal', date: 'Nov 12, 2023', location: 'Window', description: '清晨醒来看到窗边的花，像收到一天的开场白。', tags: ['Flowers', 'Morning'] },
    { title: 'Star Box', type: 'gift', importance: 'major', date: 'Nov 18, 2023', location: 'Gift Box', description: '盒子打开以后，里面不是礼物，是一整片星尘。', tags: ['Box', 'Stardust'] }
  ],
  promises: [
    { title: 'Future Home', type: 'promise', importance: 'core', date: 'Dec 01, 2023', location: 'Map Screen', description: '第一次认真谈到未来，像在星图上点亮一个家的坐标。', tags: ['Future', 'Home'] },
    { title: 'Same Orbit', type: 'promise', importance: 'major', date: 'Dec 08, 2023', location: 'Night Walk', description: '两个人的轨道不必完全一样，但可以一直相互照亮。', tags: ['Orbit', 'Together'] },
    { title: 'Next Spring', type: 'promise', importance: 'normal', date: 'Dec 14, 2023', location: 'Calendar', description: '把下一年春天先放进计划里。', tags: ['Spring', 'Plan'] },
    { title: 'Long Distance', type: 'promise', importance: 'normal', date: 'Dec 20, 2023', location: 'Station', description: '距离被认真对待以后，也能变成一条光轨。', tags: ['Distance', 'Trust'] },
    { title: 'One More Trip', type: 'promise', importance: 'normal', date: 'Dec 26, 2023', location: 'Travel List', description: '下一个目的地还没确定，但一起出发已经确定。', tags: ['Travel', 'List'] },
    { title: 'Anniversary', type: 'promise', importance: 'major', date: 'Jan 01, 2024', location: 'Rose Nebula', description: '把纪念日本身做成一个会发光的节点。', tags: ['Anniversary', 'Core'] },
    { title: 'Golden Ring', type: 'promise', importance: 'normal', date: 'Jan 10, 2024', location: 'Dream Orbit', description: '金色轨道绕过星云，也绕过很远的以后。', tags: ['Ring', 'Gold'] },
    { title: 'Always Return', type: 'promise', importance: 'major', date: 'Jan 18, 2024', location: 'Home Light', description: '无论走多远，总有一盏灯属于回来。', tags: ['Return', 'Light'] }
  ]
};

export const roseNodes: RoseNode[] = roseZones.flatMap((zone, zoneIndex) => {
  const list = nodeSeeds[zone.id] ?? [];
  return list.map((node, index) => {
    const theta = (index / list.length) * Math.PI * 2 + zoneIndex * 0.7;
    return {
      ...node,
      id: `${zone.id}-${index}`,
      zoneId: zone.id,
      theta,
      bandOffset: Math.sin(index * 1.63 + zoneIndex * 0.8) * 0.055,
      radiusOffset: Math.cos(index * 2.18 + zoneIndex) * 0.085
    };
  });
});

export function getRoseZone(id: string) {
  return roseZones.find((zone) => zone.id === id) ?? roseZones[0];
}
