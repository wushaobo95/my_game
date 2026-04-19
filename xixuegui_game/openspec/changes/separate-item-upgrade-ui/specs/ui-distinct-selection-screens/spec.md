## ADDED Requirements

### Requirement: 技能选择界面视觉风格
技能选择界面 SHALL 使用蓝绿色系配色方案，以区分于法宝选择界面。

#### Scenario: 显示技能选择界面
- **WHEN** 玩家升级后显示技能选择界面
- **THEN** 界面标题显示为"选择技能"
- **AND** 界面背景使用蓝绿色调
- **AND** 卡片边框使用绿色虚线边框
- **AND** 卡片阴影呈现绿色发光效果

### Requirement: 法宝选择界面视觉风格
法宝选择界面 SHALL 使用金橙色系配色方案，以区分于技能选择界面。

#### Scenario: 显示法宝选择界面
- **WHEN** Boss死亡后显示法宝选择界面
- **THEN** 界面标题显示为"选择法宝"
- **AND** 界面背景使用金橙色调
- **AND** 卡片边框使用金色实线边框
- **AND** 卡片阴影呈现金色发光效果

### Requirement: 动态标题显示
升级选择界面 SHALL 根据当前选择类型动态显示对应的标题文本。

#### Scenario: 技能选择标题
- **WHEN** 调用 `showUpgradeScreen()` 函数
- **THEN` upgradeTitle` 元素文本设置为"选择技能"

#### Scenario: 法宝选择标题
- **WHEN** 调用 `showItemChoiceScreen()` 函数
- **THEN** `upgradeTitle` 元素文本设置为"选择法宝"

### Requirement: 样式类动态切换
升级选择界面容器 SHALL 根据选择类型动态添加对应的样式类。

#### Scenario: 应用技能选择样式
- **WHEN** 显示技能选择界面
- **THEN** `#upgradeScreen` 元素添加 `skill-selection` 类
- **AND** `#upgradeScreen` 元素移除 `item-selection` 类

#### Scenario: 应用法宝选择样式
- **WHEN** 显示法宝选择界面
- **THEN** `#upgradeScreen` 元素添加 `item-selection` 类
- **AND** `#upgradeScreen` 元素移除 `skill-selection` 类
