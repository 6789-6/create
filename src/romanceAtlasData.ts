export type AtlasZone = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  accent: string;
  band: number;
  radius: number;
  description: string;
};

export type AtlasNode = {
  id: string;
  title: string;
  zoneId: string;
  weight: number;
  theta: number;
  bandOffset: number;
  radiusOffset: number;
  line: string;
};

export const atlasZones: AtlasZone[] = [
  { id: 'first', title: '初见星区', subtitle: 'FIRST LIGHT', color: '#ffd6ec', accent: '#ff78b8', band: 0.34, radius: 1.38, description: '靠近、试探、第一束光。' },
  { id: 'moon', title: '月光星区', subtitle: 'MOON LETTER', color: '#fff0bd', accent: '#ffd66f', band: 0.08, radius: 1.48, description: '信、月亮、慢慢说出口的话。' },
  { id: 'rain', title: '雨夜星区', subtitle: 'RAIN WINDOW', color: '#c9dcff', accent: '#8db7ff', band: -0.18, radius: 1.36, description: '窗、雨、灯和安静的陪伴。' },
  { id: 'aurora', title: '极光星区', subtitle: 'AURORA BAY', color: '#9bfff3', accent: '#5dffe7', band: 0.52, radius: 1.54, description: '远方、海面、蓝绿色光。' },
  { id: 'harbor', title: '星港星区', subtitle: 'STAR HARBOR', color: '#ffd2a2', accent: '#ffad62', band: -0.42, radius: 1.5, description: '归途、灯塔、远处停靠的船。' },
  { id: 'snow', title: '雪原星区', subtitle: 'SNOWFIELD', color: '#e7f6ff', accent: '#b8e7ff', band: 0.22, radius: 1.68, description: '雪、呼吸、清冷的光。' },
  { id: 'dream', title: '梦境星区', subtitle: 'DREAM ORBIT', color: '#e2c8ff', accent: '#b899ff', band: -0.04, radius: 1.62, description: '梦、失重、靠近又远离。' },
  { id: 'vow', title: '誓约星区', subtitle: 'VOW RING', color: '#fff3d5', accent: '#ffd28c', band: -0.62, radius: 1.44, description: '确定、戒环、未来的方向。' },
  { id: 'memory', title: '记忆星区', subtitle: 'MEMORY FILM', color: '#ffbfd6', accent: '#ff8fb5', band: 0.68, radius: 1.28, description: '旧照片、胶片、藏起来的瞬间。' }
];

const names: Record<string, string[]> = {
  first: ['第一眼','近一点','心跳延迟','并肩光','轻声问候','未命名星','初雪之前','街角灯','慢慢靠近','微光回声','眼神轨道','第一封信'],
  moon: ['月光来信','银白信纸','窗边月','未寄出的句子','夜航信标','月下回廊','白色潮汐','静默邮差','月面花园','长夜署名','纸背星尘','圆月停靠'],
  rain: ['雨夜窗前','玻璃雨痕','灯下倒影','伞沿微光','潮湿街口','蓝色屋檐','窗格星点','雨声慢放','晚风停电','水汽来信','巷尾灯','一盏室内光'],
  aurora: ['极光海湾','蓝绿远方','海面发亮','夜空潮汐','极光门','冰湖慢舞','远行坐标','透明海岸','北境微风','浮光鲸歌','星雾港湾','绿色回声'],
  harbor: ['星港告白','灯塔以南','光船停靠','金色码头','远航之前','港口回声','暖光航线','归来坐标','船尾星尘','晚霞桅杆','海风信号','泊岸之夜'],
  snow: ['雪原对白','白色呼吸','雪地脚印','冰晶窗花','清晨蓝光','雪夜远灯','冬日停格','银白湖面','手心温度','霜色轨道','风雪邮票','雪后星空'],
  dream: ['梦境轨道','失重花园','紫色雾灯','梦里回头','柔软宇宙','半透明城','睡前星图','浮岛边缘','梦核微光','云上走廊','幻彩磁场','醒来之前'],
  vow: ['未来誓约','戒环星门','并行轨道','确定方向','明日回声','金色时间','长久答案','同心坐标','未来花园','誓言刻度','安静永恒','终点之前'],
  memory: ['记忆胶片','旧照片','夏夜片段','旧车站','橘色窗帘','回忆微尘','慢镜头','背影光斑','相册深处','某年某月','未删片段','泛黄星图']
};

export const atlasNodes: AtlasNode[] = atlasZones.flatMap((zone, zi) => {
  const list = names[zone.id];
  return list.map((title, i) => {
    const t = (i / list.length) * Math.PI * 2 + zi * 0.61;
    const special = i === 0 || i === 1;
    return {
      id: `${zone.id}-${i}`,
      title,
      zoneId: zone.id,
      weight: special ? 1.8 : i < 5 ? 1.25 : 0.72,
      theta: t,
      bandOffset: Math.sin(i * 1.7 + zi) * 0.055,
      radiusOffset: Math.cos(i * 2.1 + zi) * 0.08,
      line: `${zone.description} 这个节点是一段可以进入的浪漫局部星域。`
    };
  });
});

export function getZone(id: string) {
  return atlasZones.find(z => z.id === id) || atlasZones[0];
}
