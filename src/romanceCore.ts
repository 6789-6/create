export type OrbitNode = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  note: string;
  pos: [number, number, number];
};

export const nodeSeeds = [
  ['first', '初见微光', '第一束偏向你的星光', '#ff8ac7', '时间在这一秒变轻。'],
  ['rose', '玫瑰星云', '粉色星尘在中心盛开', '#ffb0df', '不是一束花，是一整片夜空。'],
  ['moon', '月光来信', '温柔写进金色轨道', '#fff0b8', '所有没有说出口的话都有回声。'],
  ['aurora', '极光慢舞', '青绿色光带穿过夜空', '#91fff0', '安静也可以有颜色。'],
  ['future', '未来光环', '把愿望折成远环', '#ffd18b', '未来像轨道，一圈一圈靠近。']
] as const;
