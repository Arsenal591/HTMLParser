# HTML 解析
清华大学软件学院
王景隆 甘茂霖
## HTML文件的标准格式
一个标准的HTML文件必须按顺序包含如下的部分：
1. 一个可选的BOM字符；
2. 任意数量的注释与空白字符；
3. 一个`DOCTYPE`；
4. 任意数量的注释与空白字符；
5. 根元素，即`<html>`；
6. 任意数量的注释与空白字符。

### 元素
HTML的元素可分为五种：
* void元素：不包含任何内容的元素。它包括`area`,`br`,`img`,`img`,`mata`等；
* raw text元素；
* escapable raw text元素；
* foreign元素；
* 常规元素：允许包含文本、字符引用、其他元素以及注释，但其中的文本不得包含字符'<'。一些城规字符可能会对其包含的内容有更多的限制。

### 标签
标签用于声明元素的名称。一个合法的标签只能由`26 × 2 + 10 = 62`个ASCII字符组成。标签名称对大小写不敏感。

#### 开始标签
开始标签必须按如下的格式构成：
1. 第一个字符必须是'<'；
2. 紧接着的一系列字符构成标签名；
3. 如果该标签有属性，则需要跟着一个或多个空白符；
4. 接下来是一系列属性名和它们的值，属性之间需要有空白符隔开；
5. 在最后一个属性的末尾或标签名的末尾（当没有属性时），可跟随一个或多个空白符；
6. 如果该元素是void元素或foreign元素，则可跟随一个'/'；
7. 最后，开始标签以一个'>'结束。

#### 结束标签
结束标签必须按如下的格式构成：
1. 第一个字符必须是'>'；
2. 第二个字符必须是'/'；
3. 紧接着的一系列字符是对应的标签名；
4. 接下来可跟随一个或多个空白符；
5. 最后，结束标签以一个'>'结束。

#### 属性
属性在开始标签中被定义。它包含名称和值。属性名称必须包含一个或多个字符，但空白符、单（双）引号，'>','/'和'='等字符除外。
有四种定义一个属性的方式：
* 空属性：只有属性名。如：`<input disabled>`;
* Unquoted方式：属性名、零个或多个空白符、等于号、零个或多个空白符。当以此种方式定义时，属性名不能包含空白符、单（双）引号、等于号、'<'、'>'、且不能是空串；
* single-quoted方式：当以此种方式定义时，属性名不能包含单引号；
* double-quoted方式：当以此种方式定义时，属性名不能包含双引号。
同一个开始标签内，不得出现两个相同的标签名（注意：大小写不敏感）。

## 解析HTML文件
解析HTML文件需要按照本节所描述的规则，从而生成一棵DOM树。
一个完整的HTML解析过程包括词法分析（Tokenizer）和语法分析（Tree Construction）。有些时候，诸如`document.write()`的脚本会更改原有内容，因此这一步骤可能构成循环。

### 词法分析
词法分析一般用有限状态机来描述。完整的DFA拥有多达68个状态，但我们通常只需要其中的一小部分。
词法分析部分的输出是一系列token，类型有：
* DOCTYPE（不实现）
* 开始标签：具有标签名、self-closing标志，和一系列属性。
* 结束标签：具有标签名、self-closing标志，和一系列属性。
* 注释（不实现）
* 单字符：包含单个字符。
* end-of-file（不实现）

当一个token被发出时，它必须立即被语法分析器处理。优势，语法分析器会影响词法分析器所处的状态，也可能向输入流中插入额外的字符。幸运的是，我们不在这里实现这一部分。

1. Data State


| 字符      |转移      | 操作|
| -------- | -------- |-----|
| <     | Tag Open State     |
| 其他     | 原状态     |传出一个字符token|

2. Tag Open State


| 字符 | 转移 | 操作|
| -------- | -------- | ------|
|   /  | End Tag Open State ||
|   大小写字母  | Tag Name State|新建一个开始标签token，赋值为当前字符（但不传出）|
|   其他 | 解析错误    ||

3. End Tag Open State

| 字符 | 转移 | 操作|
| -------- | -------- | ------|
| 大小写字母 | Tag Name State |新建一个结束标签token，赋值为当前字符|
| 其他 | 解析错误||

4. Tag Name State

| 字符 | 转移 | 操作|
| -------- | -------- | ----| 
| 空白符（制表符、空格）     | Before Attribute State||
|  /|Self Closing Start Tag State ||
| > |Data State |传出当前的标签token|
| 大小写字母 |原状态 |将当前字符附加到当前标签token|
|  其他| 解析错误||

5. Before Attribute Name State

| 字符 | 转移| 操作|
| ---- |---- | -----|
|  空白符| 原状态| 忽略当前字符|
| / |Self Closing Start Tag State ||
| > |Data State |传出当前的标签token|
| 大小写字母 |Attribute Name State |在当前的标签token上新建一个属性，并赋为当前字符|
| 其他 | 解析错误 ||

6. Attribute Name State

| 字符 |转移 | 操作 |
| ---- | ---- | ----|
| 空白符 | After Attribute Name State||
|  /| Self Closing Start Tag State ||
| = |Before Attribute Value State ||
| > |Data State |传出当前的标签token|
| 引号、< |解析错误 ||
| 其他 | 原状态 |将当前字符附加到当前属性名上|

7. After Attribute Name State

| 字符 | 转移 | 操作|
| ---- | ---- | ---- |
| 空白符 | 原状态| 忽略当前字符|
| /| Self Closing Start Tag State |
| = |Before Attribute Value State |
| > |Data State | 传出当前标签token|
| 大小写字母| Attribute Name State |在当前标签token上新建一个属性，并赋值为当前字符|
| 其他 | 解析错误 ||

8. Before Attribute Value State

| 字符 | 转移| 操作|
| ---- |---- |----|
| 空白符 | 原状态 | 忽略当前字符 |
| " | Attribute Value(double-quoted) State| |
| ' | Attribute Value(single-quoted) State| |
| > = < |解析错误 | |
| 其他 | Attribute Value(unquoted) State|将当前字符附加到到当前属性的值上 |

9. attribute value(double-quoted) state

| 字符 |转移 | 操作|
| ---- |---- |---- |
| " |after attribute value(quoted) state | |
| 其他 | 原状态|将当前字符附加到当前属性的值 |

10. attribute value(single-quoted) state
11. 
| 字符 | 转移 |操作 |
| ---- |---- |---- |
| ' | ater attribute value(quoted) state| |
| 其他 |原状态 |将当前字符附加到当前属性的值 |

11. attribute value(unquoted) state

| 字符 |转移 |操作 |
| ---- | ----|---- |
| 空白符| before attribute name state | |
| > |data state |传出当前的标签token |
| 引号 < = |解析错误 | |
|  其他|原状态 |将当前字符附加到当前属性的值 |

12. after attribute value(quoted) state

| 字符 | 转移|操作 |
| ---- |---- |---- |
| 空白符 |before attribute name state | |
| / |self closing start tage state | |
| > |data state |传出当前的标签token |
| 其他 |解析错误 | |

13. self closing start tag state

| 字符 |转移 |操作 |
| ---- |---- |---- |
| > |data state |设置当前标签的self-closing标志，并传出当前标签token
| 其他 |解析错误 | |

### 语法分析
语法分析部分的输入是从词法分析器而来的token序列。类似地，标准的语法分析也可通过一个DFA来描述，但要比词法分析更加繁琐（因为要对标签的语义进行详尽的讨论）。为了简化工作，我们省略了这里绝大部分的实现。
大体上，我们把token序列看做对DOM树的先序遍历路径：当读入开始标签token时，添加新元素并移到该元素处；当读入结束标记时，移到父元素的位置；否则，在当前元素上进行操作。
在构建一个新元素节点时，可以检查属性名称和属性取值是否合法（也比较繁琐）；在试图回到父节点时，需要检查标签名称是否合法。

### API实现
在正确构建DOM树后，就可以在此基础上实现基础的API。
API列表：待更新。