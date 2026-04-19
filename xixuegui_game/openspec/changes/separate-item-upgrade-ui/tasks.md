## 1. HTML 结构更新

- [x] 1.1 在 `index.html` 的 `#upgradeScreen` 中添加标题元素 `<div id="upgradeTitle"></div>`
- [x] 1.2 确保标题元素位于卡片容器之前，便于CSS定位和样式控制

## 2. CSS 样式实现

- [x] 2.1 移除 `#upgradeScreen::before` 伪元素样式（硬编码的"选择技能"标题）
- [x] 2.2 添加 `#upgradeTitle` 基础样式（字体大小、颜色、定位）
- [x] 2.3 添加 `.skill-selection` 类样式（蓝绿色系背景、边框颜色）
- [x] 2.4 添加 `.item-selection` 类样式（金橙色系背景、边框颜色）
- [x] 2.5 添加 `.skill-selection .upgrade-card` 卡片样式（绿色虚线边框、绿色阴影）
- [x] 2.6 添加 `.item-selection .upgrade-card` 卡片样式（金色实线边框、金色发光阴影）

## 3. JavaScript 逻辑更新

- [x] 3.1 在 `showUpgradeScreen()` 函数中设置标题为"选择技能"
- [x] 3.2 在 `showUpgradeScreen()` 函数中添加 `#upgradeScreen` 的 `skill-selection` 类
- [x] 3.3 在 `showUpgradeScreen()` 函数中移除 `item-selection` 类（如果存在）
- [x] 3.4 在 `showItemChoiceScreen()` 函数中设置标题为"选择法宝"
- [x] 3.5 在 `showItemChoiceScreen()` 函数中添加 `#upgradeScreen` 的 `item-selection` 类
- [x] 3.6 在 `showItemChoiceScreen()` 函数中移除 `skill-selection` 类（如果存在）

## 4. 文案配置更新

- [x] 4.1 在 `strings.js` 的 `UI` 对象中添加 `SKILL_CHOICE_TITLE: '选择技能'`
- [x] 4.2 在 `strings.js` 的 `UI` 对象中添加 `ITEM_CHOICE_TITLE: '选择法宝'`
- [x] 4.3 更新JavaScript函数使用文案配置而非硬编码字符串

## 5. 测试验证

- [ ] 5.1 测试升级时技能选择界面显示正确（标题、颜色、边框）
- [ ] 5.2 测试Boss死亡后法宝选择界面显示正确（标题、颜色、边框）
- [ ] 5.3 验证两种界面切换时样式正确更新（无残留样式类）
- [ ] 5.4 验证选择功能正常工作（点击卡片能正确应用效果）
