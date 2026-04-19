## Why

当前游戏中，技能升级选择和法宝(Boss掉落)选择共用同一个UI界面(`#upgradeScreen`)，使用完全相同的样式和布局。这导致玩家无法直观区分正在选择的是临时技能升级还是永久法宝道具，降低了游戏体验。需要通过视觉设计（颜色、图标、边框、标题等）清晰区分这两种不同的选择类型。

## What Changes

- **CSS样式分离**: 为技能选择和法宝选择创建独立的CSS类，使用不同的配色方案
  - 技能选择：使用蓝色/绿色系，表示成长和能力提升
  - 法宝选择：使用金色/橙色系，表示稀有道具和宝物
- **动态标题**: 移除硬编码的CSS伪元素标题，改为JavaScript动态设置标题文本
- **边框和背景差异化**: 技能卡片和法宝卡片使用不同的边框颜色、阴影效果
- **HTML结构优化**: 在`#upgradeScreen`中添加显式的标题元素，便于动态更新
- **JavaScript逻辑更新**: 
  - `showUpgradeScreen()`: 应用技能选择样式和标题
  - `showItemChoiceScreen()`: 应用法宝选择样式和标题

## Capabilities

### New Capabilities
- `ui-distinct-selection-screens`: 区分技能选择和法宝选择的UI视觉设计系统，包括独立的配色、标题、边框样式

### Modified Capabilities
- （无现有spec需要修改，这是纯UI样式改进）

## Impact

- **CSS文件** (`css/style.css`): 添加新的样式类，移除原有的`::before`伪元素标题
- **HTML文件** (`index.html`): 修改`#upgradeScreen`结构，添加标题元素
- **JavaScript文件** (`js/systems/upgrade.js`): 更新`showUpgradeScreen()`和`showItemChoiceScreen()`函数，动态设置样式类和标题
- **文案配置** (`js/core/strings.js`): 确保标题文案正确配置
