// Display copy only: never normalizes or changes the persisted primaryTick.
export function storyTickIntervalLabel(tick) {
 const unit={year:'年',month:'个月',day:'天'}[tick?.unit];
 return unit&&Number.isSafeInteger(Number(tick?.step))&&Number(tick.step)>0
  ? `每 ${tick.step} ${unit}显示一个大刻度`
  : '请填写大于零的整数间隔。';
}
