Based on http://wiki.luajit.org/Bytecode-2.0

<h2><a class="anchor" id="introduction" href="#introduction"><i class="fa fa-link"></i></a>Introduction</h2>

<p>The following document describes the LuaJIT 2.0 bytecode instructions.
See <code>src/lj_bc.h</code> in the LuaJIT source code for details. The bytecode
can be listed with <code>luajit -bl</code>, see the
<a href="http://luajit.org/running.html#opt_b">-b option</a>.</p>

<p>A single bytecode instruction is 32 bit wide and has an 8 bit opcode field
and several operand fields of 8 or 16 bit. Instructions come in one of two
formats:</p>

<table>
<tr>
<td>B</td>
<td>C</td>
<td>A</td>
<td>OP</td>
</tr>
<tr>
<td colspan="2"><center>D</center></td>
<td>A</td>
<td>OP</td>
</tr>
</table>

<p>The figure shows the least-significant bit on the right. In-memory
instructions are always stored in host byte order. E.g. 0xbbccaa1e
is the instruction with opcode 0x1e (<code>ADDVV</code>), with operands A = 0xaa,
B = 0xbb and C = 0xcc.</p>

<p>The suffix(es) of the instruction name distinguish variants of the
same basic instruction:</p>

<ul>
<li>V 变量位</li>
<li>S 字符串常量</li>
<li>N 数值常量</li>
<li>P 基本类型</li>
<li>B 无符号字节字面量</li>
<li>M 混合参数/返回值</li>
</ul>

<p>可能的操作数类型:</p>

<ul>
<li>(none): 不使用</li>
<li>var: 变量号</li>
<li>dst: 变量号, 作为目的操作数使用</li>
<li>base: 基本变量号, 可读可写</li>
<li>rbase: 基本变量号, 只读</li>
<li>uv: 保持变量号,用0x8000|本地变量号或者是上级保存变量号</li>
<li>lit: 字面量</li>
<li>lits: 有符号字面量</li>
<li>pri: 原始类型 (0 = nil, 1 = false, 2 = true)</li>
<li>num: 数值常量, 一个到常量表的索引号</li>
<li>str: 字符串常量, 一个到常量表的反向索引号</li>
<li>tab: 模板表, 一个到常量表的反向索引号</li>
<li>func: 函数原型, 一个到常量表的反向索引号</li>
<li>cdata: 字符常量, 一个到常量表的反向索引号</li>
<li>jump: 转移目标, 相对于下一个指令, 基于0x8000偏移</li>
</ul>

<h2><a class="anchor" id="comparison-ops" href="#comparison-ops"><i class="fa fa-link"></i></a>比较操作</h2>

<p>All comparison and test ops are immediately followed by a <code>JMP</code>
instruction which holds the target of the conditional jump. All
comparisons and tests jump to the target if the comparison or test is
true. Otherwise they fall through to the instruction <em>after</em> the <code>JMP</code>.</p>

ISLT --> lt 1  
ISGE --> lt 0  
ISLE --> le 1  
ISGT --> le 0  
ISEQV / ISEQS / ISEQN / ISEQP --> eq 1  
ISNEV / ISNES / ISNEN / ISNEP --> eq 0  
<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>定义</th>
<th>Lua Bytecode</th>
</tr>
<tr>
<td>ISLT</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A &lt; D</td>
<td>lt 1 a d</td>
</tr>
<tr>
<td>ISGE</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A ≥ D</td>
<td>lt 0 a d</td>
</tr>
<tr>
<td>ISLE</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A ≤ D</td>
<td>le 1 a d</td>
</tr>
<tr>
<td>ISGT</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A &gt; D</td>
<td>le 0 a d</td>
</tr>
<tr>
<td>ISEQV</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A = D</td>
<td>eq 1 a d</td>
</tr>
<tr>
<td>ISNEV</td>
<td>var</td>
<td colspan="2">var</td>
<td>Jump if A ≠ D</td>
<td>eq 0 a d</td>
</tr>
<tr>
<td>ISEQS</td>
<td>var</td>
<td colspan="2">str</td>
<td>Jump if A = D</td>
<td>eq 1 a d</td>
</tr>
<tr>
<td>ISNES</td>
<td>var</td>
<td colspan="2">str</td>
<td>Jump if A ≠ D</td>
<td>eq 0 a d</td>
</tr>
<tr>
<td>ISEQN</td>
<td>var</td>
<td colspan="2">num</td>
<td>Jump if A = D</td>
<td>eq 1 a d</td>
</tr>
<tr>
<td>ISNEN</td>
<td>var</td>
<td colspan="2">num</td>
<td>Jump if A ≠ D</td>
<td>eq 0 a d</td>
</tr>
<tr>
<td>ISEQP</td>
<td>var</td>
<td colspan="2">pri</td>
<td>Jump if A = D</td>
<td>eq 1 a d</td>
</tr>
<tr>
<td>ISNEP</td>
<td>var</td>
<td colspan="2">pri</td>
<td>Jump if A ≠ D</td>
<td>eq 0 a d</td>
</tr>
</table>

<p><em>Q</em>: Why do we need four different ordered comparisons? Wouldn't <code>&lt;</code> and
<code>&lt;=</code> suffice with appropriately swapped operands?</p>

<p><em>A</em>: No, because for floating-point comparisons <code>(x &lt; y)</code> is <em>not</em> the
same as <code>not (x &gt;= y)</code> in the presence of NaNs.</p>

<p>The LuaJIT parser preserves the ordered comparison semantics of the
source code as follows:</p>

<table>
<tr>
<th>Source code</th>
<th>Bytecode</th>
<th>Lua Bytecode</th>
</tr>
<tr>
<td>if x &lt; y then</td>
<td>ISGE x y</td>
<td>lt 0 x y</td>
</tr>
<tr>
<td>if x &lt;= y then</td>
<td>ISGT x y</td>
<td>le 0 x y</td>
</tr>
<tr>
<td>if x &gt; y then</td>
<td>ISGE y x</td>
<td>lt 0 y x</td>
</tr>
<tr>
<td>if x &gt;= y then</td>
<td>ISGT y x</td>
<td>le 0 y x</td>
</tr>
<tr>
<td>if not (x &lt; y) then</td>
<td>ISLT x y</td>
<td>lt 1 x y</td>
</tr>
<tr>
<td>if not (x &lt;= y) then</td>
<td>ISLE x y</td>
<td>le 1 x y</td>
</tr>
<tr>
<td>if not (x &gt; y) then</td>
<td>ISLT y x</td>
<td>lt 1 y x</td>
</tr>
<tr>
<td>if not (x &gt;= y) then</td>
<td>ISLE y x</td>
<td>le 1 y x</td>
</tr>
</table>

<p>(In)equality comparisons are swapped as needed to bring constants to the right.</p>

<h2><a class="anchor" id="unary-test-and-copy-ops" href="#unary-test-and-copy-ops"><i class="fa fa-link"></i></a>一元检查与拷贝操作</h2>

<p>These instructions test whether a variable evaluates to true or false in
a boolean context. In Lua only <code>nil</code> and <code>false</code> are considered false,
all other values are true. These instructions are generated for simple
truthness tests like <code>if x then</code> or when evaluating the <code>and</code> and <code>or</code>
operators.</p>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>Description</th>
<th>Lua Bytecode</th>
</tr>
<tr>
<td>ISTC</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Copy D to A and jump, if D is true</td>
<td>testset a d 1</td>
</tr>
<tr>
<td>ISFC</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Copy D to A and jump, if D is false</td>
<td>testset a d 0</td>
</tr>
<tr>
<td>IST</td>
<td> </td>
<td colspan="2">var</td>
<td>Jump if D is true</td>
<td>test d 1</td>
</tr>
<tr>
<td>ISF</td>
<td> </td>
<td colspan="2">var</td>
<td>Jump if D is false</td>
<td>test d 0</td>
</tr>
<tr>
<td>ISTYPE</td>
<td>var</td>
<td colspan="2">lit</td>
<td>new in 2.1.0-beta1</td>
<td></td>
</tr>
<tr>
<td>ISNUM</td>
<td>var</td>
<td colspan="2">lit</td>
<td>new in 2.1.0-beta1</td>
<td></td>
</tr>
</table>

<p><em>Q</em>: 为什么我们需要测试与拷贝操作?</p>

<p><em>A</em>: 在Lua中  <code>and</code> 和 <code>or</code> 会返回他们操作数中的一个原始值. It's generally only known whether the result is
unused after parsing the full expression. In this case the test and copy
ops can easily be turned into test ops in the previously emitted bytecode.</p>

<h2><a class="anchor" id="unary-ops" href="#unary-ops"><i class="fa fa-link"></i></a>一元操作</h2>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>Description</th>
<th>Lua Bytecode</th>
</tr>
<tr>
<td>MOV</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Copy D to A</td>
<td>move a d</td>
</tr>
<tr>
<td>NOT</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Set A to boolean not of D</td>
<td>not a d</td>
</tr>
<tr>
<td>UNM</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Set A to -D (unary minus)</td>
<td>unm a d</td>
</tr>
<tr>
<td>LEN</td>
<td>dst</td>
<td colspan="2">var</td>
<td>Set A to #D (object length)</td>
<td>len a d</td>
</tr>
</table>

<h2><a class="anchor" id="binary-ops" href="#binary-ops"><i class="fa fa-link"></i></a>二进制操作</h2>

ADDVN / ADDVV ---> add  加
SUBVN / SUBVV ---> sub  减
MULVN / MULVV ---> mul  乘
DIVVN / DIVVV ---> div  除
MODVN / MODVV ---> mod  取模
POW ---> pow  次方

ADDNV A B C ---> add a c b  
SUBNV A B C ---> sub a c b  
MULNV A B C ---> mul a c b  
DIVNV A B C ---> div a c b  
MODNV A B C ---> mod a c b  

CAT ---> concat  合并

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th width="35"><center>B</center></th>
<th width="35"><center>C</center></th>
<th>Description</th>
<th>Lua Bytecode</th>
</tr>
<tr>
<td>ADDVN</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = B + C</td>
<td>add a b c</td>
</tr>
<tr>
<td>SUBVN</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = B - C</td>
<td>sub a b c</td>
</tr>
<tr>
<td>MULVN</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = B * C</td>
<td>mul a b c</td>
</tr>
<tr>
<td>DIVVN</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = B / C</td>
<td>div a b c</td>
</tr>
<tr>
<td>MODVN</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = B % C</td>
<td>mod a b c</td>
</tr>
<tr>
<td>ADDNV</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = C + B</td>
<td>add a c b</td>
</tr>
<tr>
<td>SUBNV</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = C - B</td>
<td>sub a c b</td>
</tr>
<tr>
<td>MULNV</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = C * B</td>
<td>mul a c b</td>
</tr>
<tr>
<td>DIVNV</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = C / B</td>
<td>div a c b</td>
</tr>
<tr>
<td>MODNV</td>
<td>dst</td>
<td>var</td>
<td>num</td>
<td>A = C % B</td>
<td>mod a c b</td>
</tr>
<tr>
<td>ADDVV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B + C</td>
<td>add a b c</td>
</tr>
<tr>
<td>SUBVV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B - C</td>
<td>sub a b c</td>
</tr>
<tr>
<td>MULVV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B * C</td>
<td>mul a b c</td>
</tr>
<tr>
<td>DIVVV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B / C</td>
<td>div a b c</td>
</tr>
<tr>
<td>MODVV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B % C</td>
<td>mod a b c</td>
</tr>
<tr>
<td>POW</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B ^ C</td>
<td>pow a b c</td>
</tr>
<tr>
<td>CAT</td>
<td>dst</td>
<td>rbase</td>
<td>rbase</td>
<td>A = B .. ~ .. C</td>
<td>concat a b c</td>
</tr>
</table>

<p><em>Note</em>: The <code>CAT</code> instruction concatenates all values in variable slots B to C
inclusive.</p>

<h2><a class="anchor" id="constant-ops" href="#constant-ops"><i class="fa fa-link"></i></a>常量操作</h2>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>定义</th>
<th>Lua Bytecode</th>
<th>附注</th>
</tr>
<tr>
<td>KSTR</td>
<td>dst</td>
<td colspan="2">str</td>
<td>将A设置为常量D</td>
<td>loadk a d</td>
</tr>
<tr>
<td>KCDATA</td>
<td>dst</td>
<td colspan="2">cdata</td>
<td>将A设置为cdata常量D</td>
<td>?</td>
</tr>
<tr>
<td>KSHORT</td>
<td>dst</td>
<td colspan="2">lits</td>
<td>将 A 设置为 16 bit 有符号整型 D</td>
<td>loadk a *d</td>
<td>need to add a new constant D</td>
</tr>
<tr>
<td>KNUM</td>
<td>dst</td>
<td colspan="2">num</td>
<td>将A 设置为数值常量 D</td>
<td>loadk a d</td>
</tr>
<tr>
<td>KPRI</td>
<td>dst</td>
<td colspan="2">pri</td>
<td>将A 设置为原始类型 D</td>
<td>
d==0 --> loadnil a a <br/>
d==1 --> loadbool a 0 0 <br/>
d==2 --> loadbool a 1 0
</td>
<td>
local a=not (b or c) <br/>
<br/>
[6] jmp        2            ; pc+=2 (goto [9]) <br/>
[7] loadbool   0   0   1    ; R0 := false; PC := pc+=1 (goto [9]) <br/>
[8] loadbool   0   1   0    ; R0 := true <br/>
<br/>
0006    JMP      1 => 0010 <br/>
0007 => KPRI     0   1 <br/>
0008    JMP      1 => 0010 <br/>
0009    KPRI     0   2 <br/>
</td>
</tr>
<tr>
<td>KNIL</td>
<td>base</td>
<td colspan="2">base</td>
<td>Set slots A to D to nil</td>
<td>loadnil a d</td>
</tr>
</table>

<p><em>Note</em>: 单独的<code>nil</code>值用<code>KPRI</code>设置. <code>KNIL</code>仅用于将多个值置 <code>nil</code>.</p>

<h2><a class="anchor" id="upvalue-and-function-ops" href="#upvalue-and-function-ops"><i class="fa fa-link"></i></a>保持变量与函数操作</h2>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>定义</th>
<th>Lua Bytecode</th>
<th>附注</th>
</tr>
<tr>
<td>UGET</td>
<td>dst</td>
<td colspan="2">uv</td>
<td>将 A设置为保持变量 D</td>
<td>getupval a d</td>
</tr>
<tr>
<td>USETV</td>
<td>uv</td>
<td colspan="2">var</td>
<td>Set upvalue A to D</td>
<td>setupval a d</td>
</tr>
<tr>
<td>USETS</td>
<td>uv</td>
<td colspan="2">str</td>
<td>Set upvalue A to string constant D</td>
<td>
loadk *tmp d <br/>
setupval a *tmp
</td>
</tr>
<tr>
<td>USETN</td>
<td>uv</td>
<td colspan="2">num</td>
<td>Set upvalue A to number constant D</td>
<td>
loadk *tmp d <br/>
setupval a *tmp
</td>
</tr>
<tr>
<td>USETP</td>
<td>uv</td>
<td colspan="2">pri</td>
<td>Set upvalue A to primitive D</td>
<td>
loadnil/loadbool *tmp d , see KPRI<br/>
setupval a *tmp
</td>
</tr>
<tr>
<td>UCLO</td>
<td>rbase</td>
<td colspan="2">jump</td>
<td>Close upvalues for slots ≥ rbase and jump to target D</td>
<td>
close a <br/>
jmp d
</td>
<td>UCLO before RET* can be ignore</td>
</tr>
<tr>
<td>FNEW</td>
<td>dst</td>
<td colspan="2">func</td>
<td>使用原型D创建一个闭包 并将它存储在 A中</td>
<td>
closure a d <br/>
move/getupval ... , for upvals
</td>
<td>remember to add n move/getupval , n是被闭包使用的保持变量的数量</td>
</tr>
</table>

<p><em>Q</em>: 为什么<code>UCLO</code>有跳转目标?</p>

<p><em>A</em>: <code>UCLO</code> 通常在一个块中是最后的指令,并且<code>JMP</code>经常紧随其后
. 将jump合并到<code>UCLO</code>中科院加快执行并且简化步骤  (see <code>fs_fixup_ret()</code> in
<code>src/lj_parse.c</code>). A non-branching <code>UCLO</code> simply jumps to the next
instruction.</p>

<h2><a class="anchor" id="table-ops" href="#table-ops"><i class="fa fa-link"></i></a>表操作</h2>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th width="35"><center>B</center></th>
<th width="35"><center>C/D</center></th>
<th>Description</th>
<th>Lua Bytecode</th>
<th>Comment</th>
</tr>
<tr>
<td>TNEW</td>
<td>dst</td>
<td></td>
<td>lit</td>
<td>将 A 设置为大小为 D的新表 (see below)</td>
<td>newtable a *arraysize *hashsize</td>
<td>calucate arraysize and hashsize from D</td>
</tr>
<tr>
<td>TDUP</td>
<td>dst</td>
<td></td>
<td>tab</td>
<td>将 A设置为复制的模板表 D</td>
<td>
newtable a *arraysize *hashsize <br/>
*move *tmpx *constarray <br/>
*setlist a *tmpx <br/>
*settable a *consthashkey *consthashvalue
</td>
<td>Extract luajit table constant D to multiple contants and multiple settable opcodes</td>
</tr>
<tr>
<td>GGET</td>
<td>dst</td>
<td></td>
<td>str</td>
<td>A = _G[D]</td>
<td>getglobal a d</td>
</tr>
<tr>
<td>GSET</td>
<td>var</td>
<td></td>
<td>str</td>
<td>_G[D] = A</td>
<td>setglobal a d</td>
</tr>
<tr>
<td>TGETV</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td>A = B[C]</td>
<td>gettable a b c</td>
</tr>
<tr>
<td>TGETS</td>
<td>dst</td>
<td>var</td>
<td>str</td>
<td>A = B[C]</td>
<td>gettable a b c</td>
</tr>
<tr>
<td>TGETR</td>
<td>dst</td>
<td>var</td>
<td>var</td>
<td></td>
<td></td>
<td>new in 2.1.0-beta1</td>
</tr>
<tr>
<td>TGETB</td>
<td>dst</td>
<td>var</td>
<td>lit</td>
<td>A = B[C]</td>
<td>gettable a b *c</td>
<td>Need to add a new constant c (unsigned integer index (0..255))</td>
</tr>
<tr>
<td>TSETV</td>
<td>var</td>
<td>var</td>
<td>var</td>
<td>B[C] = A</td>
<td>settable b c a</td>
</tr>
<tr>
<td>TSETS</td>
<td>var</td>
<td>var</td>
<td>str</td>
<td>B[C] = A</td>
<td>settable b c a</td>
</tr>
<tr>
<td>TSETB</td>
<td>var</td>
<td>var</td>
<td>lit</td>
<td>B[C] = A</td>
<td>settable b *c a</td>
<td>Need to add a new constant c (unsigned integer index (0..255))</td>
</tr>
<tr>
<td>TSETM</td>
<td>base</td>
<td></td>
<td>num*</td>
<td>(A-1)[D], (A-1)[D+1], ... = A, A+1, ...</td>
<td>setlist a-1 0 *c</td>
<td>
{...} or {f()}, following a vararg or call* <br/>
like {1,2,3,...} cause *c too complex
</td>
</tr>
<tr>
<td>TSETR</td>
<td>var</td>
<td>var</td>
<td>var</td>
<td></td>
<td></td>
<td>new in 2.1.0-beta1</td>
</tr>
</table>

<p><em>Notes</em>:</p>

<ul>
<li>The 16 bit literal D operand of <code>TNEW</code> is split up into two fields: the lowest 11 bits give the array size (allocates slots 0..asize-1, or none if zero). The upper 5 bits give the hash size as a power of two (allocates 2^hsize hash slots, or none if zero).</li>
<li>
<code>GGET</code> and <code>GSET</code> are named 'global' get and set, but actually index the current function environment <code>getfenv(1)</code> (which is usually the same as <code>_G</code>).</li>
<li>
<code>TGETB</code> and <code>TSETB</code> interpret the 8 bit literal C operand as an unsigned integer index (0..255) into table B.</li>
<li>Operand D of <code>TSETM</code> points to a biased floating-point number in the constant table. Only the lowest 32 bits from the mantissa are used as a starting table index. MULTRES from the previous bytecode gives the number of table slots to fill.</li>
</ul>

<h2><a class="anchor" id="calls-and-vararg-handling" href="#calls-and-vararg-handling"><i class="fa fa-link"></i></a>函数调用与可变参数处理</h2>

<p>
所有的调用命令都需要一个特殊步骤:被调用函数(或对象)在A中,接着是连续的参数,操作数C是一个或以上的固定参数,操作数B是一个或以上的返回值,或者为0代表返回所有返回值(要相应的设置MULTRES)</p>

<p>操作数 C表示调用带固定参数的个数 (<code>CALLM</code> or <code>CALLMT</code>) . MULTRES is added to that to get the
actual number of arguments to pass.</p>

<p>For consistency, the specialized call instructions <code>ITERC</code>, <code>ITERN</code> and
the vararg instruction <code>VARG</code> share the same operand format. Operand C
of <code>ITERC</code> and <code>ITERN</code> is always 3 = 1+2, i.e. two arguments are passed
to the iterator function. Operand C of <code>VARG</code> is repurposed to hold the
number of fixed arguments of the enclosing function. This speeds up
access to the variable argument part of the vararg pseudo-frame below.</p>

<p>MULTRES is an internal variable that keeps track of the number of
results returned by the previous call or by <code>VARG</code> instructions with
multiple results. It's used by calls (<code>CALLM</code> or <code>CALLMT</code>) or returns
(<code>RETM</code>) with multiple arguments and by a table initializer (<code>TSETM</code>).</p>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th width="35"><center>B</center></th>
<th width="35"><center>C/D</center></th>
<th>定义</th>
<th>Lua Bytecode</th>
<th>附注</th>
</tr>
<tr>
<td>CALLM</td>
<td>base</td>
<td>lit</td>
<td>lit</td>
<td>Call: A, ..., A+B-2 = A(A+1, ..., A+C+MULTRES)</td>
<td>call a 0 b</td>
<td>0代表使用所有先前或可变的参数,1代表无返回值,2代表有一个返回值</td>
</tr>
<tr>
<td>CALL</td>
<td>base</td>
<td>lit</td>
<td>lit</td>
<td>Call: A, ..., A+B-2 = A(A+1, ..., A+C-1)</td>
<td>call a c b</td>
<td>不使用MULTRES的函数调用,C为1表示无参数,C为2表示有一个参数
</tr>
<tr>
<td>CALLMT</td>
<td>base</td>
<td></td>
<td>lit</td>
<td>尾调用: return A(A+1, ..., A+D+MULTRES)</td>
<td>tailcall a 0 0</td>
<td>0代表使用所有先前或可变的参数</td>
</tr>
<tr>
<td>CALLT</td>
<td>base</td>
<td></td>
<td>lit</td>
<td>尾调用: return A(A+1, ..., A+D-1)</td>
<td>tailcall a d 0</td>
</tr>
<tr>
<td>ITERC</td>
<td>base</td>
<td>lit</td>
<td>lit</td>
<td>调用迭代器: A, A+1, A+2 = A-3, A-2, A-1; A, ..., A+B-2 = A(A+1, A+2)</td>
<td>? tforloop</td>
</tr>
<tr>
<td>ITERN</td>
<td>base</td>
<td>lit</td>
<td>lit</td>
<td>特化 ITERC, 如果迭代函数 A-3 是 next()的情况</td>
<td>? tforloop</td>
</tr>
<tr>
<td>VARG</td>
<td>base</td>
<td>lit</td>
<td>lit</td>
<td>Vararg: A, ..., A+B-2 = ...</td>
<td>vararg a b</td>
</tr>
<tr>
<td>ISNEXT</td>
<td>base</td>
<td></td>
<td>jump</td>
<td>验证 ITERN 特征并且跳转</td>
<td>?</td>
</tr>
</table>

<p><em>Note</em>: Lua语法分析器会启发式的决定在循环中是否需要使用<code>pairs()</code> 或者
<code>next()</code> . 在这种情况下,  <code>JMP</code> 和迭代器调用<code>ITERC</code> 可以被特殊版本的
<code>ISNEXT</code> 和 <code>ITERN</code>所取代.</p>

<p><code>ISNEXT</code> 在运行时检查迭代器是否是 <code>next()</code>
函数, 函数的参数是一个表并且控制变量是
<code>nil</code>.之后他为控制变量设置为32bit的零并且跳转到迭代函数,这个函数通过表的键,使用这个数字进行有效的迭代.</p>

<p>如果任何条件不符, 这个字节码在运行时中会退化为 <code>JMP</code> 和 <code>ITERC</code>.</p>

<h2><a class="anchor" id="returns" href="#returns"><i class="fa fa-link"></i></a>函数返回</h2>

<p>All return instructions copy the results starting at slot A down to the
slots starting at one below the base slot (the slot holding the frame
link and the currently executing function).</p>

<p>The <code>RET0</code> and <code>RET1</code> instructions are just specialized versions of <code>RET</code>.
Operand D is one plus the number of results to return.</p>

<p>For <code>RETM</code>, operand D holds the number of fixed results to return.
MULTRES is added to that to get the actual number of results to return.</p>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>Description</th>
<th>Lua Bytecode</th>
<th>Comment</th>
</tr>
<tr>
<td>RETM</td>
<td>base</td>
<td colspan="2">lit</td>
<td>return A, ..., A+D+MULTRES-1</td>
<td>return a 0</td>
<td>0 means use all args of previous call or vararg</td>
</tr>
<tr>
<td>RET</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>return A, ..., A+D-2</td>
<td>return a d</td>
</tr>
<tr>
<td>RET0</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>return</td>
<td>return 0 1</td>
</tr>
<tr>
<td>RET1</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>return A</td>
<td>return a 2</td>
</tr>
</table>

<h2><a class="anchor" id="loops-and-branches" href="#loops-and-branches"><i class="fa fa-link"></i></a>循环与分支</h2>

<p>Lua语言提供四种循环类型,每个都被翻译为不同的字节码命令:</p>

<ul>
<li>数字 'for' 循环: <code>for i=start,stop,step do body end</code> =&gt; set start,stop,step <code>FORI</code> body <code>FORL</code>
</li>
<li>迭代器 'for' 循环: <code>for vars... in iter,state,ctl do body end</code> =&gt; set iter,state,ctl <code>JMP</code> body <code>ITERC</code> <code>ITERL</code>
</li>
<li> 'while' 循环: <code>while cond do body end</code> =&gt; inverse-cond-<code>JMP</code> <code>LOOP</code> body <code>JMP</code>
</li>
<li> 'repeat' 循环: <code>repeat body until cond</code> =&gt; <code>LOOP</code> body cond-<code>JMP</code>
</li>
</ul>

<p> <code>break</code> 与 <code>goto</code> 声明 被翻译为无条件
<code>JMP</code> 或 <code>UCLO</code> 命令.</p>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>定义</th>
<th>Lua Bytecode</th>
<th>附注</th>
</tr>
<tr>
<td>FORI</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Numeric 'for' loop init</td>
</tr>
<tr>
<td>JFORI</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Numeric 'for' loop init, JIT-compiled</td>
</tr>
<tr>
<td>FORL</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Numeric 'for' loop</td>
</tr>
<tr>
<td>IFORL</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Numeric 'for' loop, force interpreter</td>
</tr>
<tr>
<td>JFORL</td>
<td>base</td>
<td colspan="2">lit</td>
<td>Numeric 'for' loop, JIT-compiled</td>
</tr>
<tr>
<td>ITERL</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Iterator 'for' loop</td>
</tr>
<tr>
<td>IITERL</td>
<td>base</td>
<td colspan="2">jump</td>
<td>Iterator 'for' loop, force interpreter</td>
</tr>
<tr>
<td>JITERL</td>
<td>base</td>
<td colspan="2">lit</td>
<td>Iterator 'for' loop, JIT-compiled</td>
</tr>
<tr>
<td>LOOP</td>
<td>rbase</td>
<td colspan="2">jump</td>
<td>Generic loop</td>
</tr>
<tr>
<td>ILOOP</td>
<td>rbase</td>
<td colspan="2">jump</td>
<td>Generic loop, force interpreter</td>
</tr>
<tr>
<td>JLOOP</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>Generic loop, JIT-compiled</td>
</tr>
<tr>
<td>JMP</td>
<td>rbase</td>
<td colspan="2">jump</td>
<td>Jump</td>
</tr>
</table>

<p>Operand A holds the first unused slot for the <code>JMP</code> instruction, the
base slot for the loop control variables of the <code>*FOR*</code> instructions
(<code>idx</code>, <code>stop</code>, <code>step</code>, <code>ext idx</code>) or the base of the returned results
from the iterator for the <code>*ITERL</code> instructions (stored below are
<code>func</code>, <code>state</code> and <code>ctl</code>).</p>

<p>The <code>JFORL</code>, <code>JITERL</code> and <code>JLOOP</code> instructions store the trace number in
operand D (<code>JFORI</code> retrieves it from the corresponding <code>JFORL</code>).
Otherwise, operand D points to the first instruction after the loop.</p>

<p>The <code>FORL</code>, <code>ITERL</code> and <code>LOOP</code> instructions do hotspot detection. Trace
recording is triggered if the loop is executed often enough.</p>

<p>The <code>IFORL</code>, <code>IITERL</code> and <code>ILOOP</code> instructions are used by the
JIT-compiler to blacklist loops that cannot be compiled. They don't do
hotspot detection and force execution in the interpreter.</p>

<p>The <code>JFORI</code>, <code>JFORL</code>, <code>JITERL</code> and <code>JLOOP</code> instructions enter a
JIT-compiled trace if the loop-entry condition is true.</p>

<p>The <code>*FORL</code> instructions do <code>idx = idx + step</code> first. All <code>*FOR*</code>
instructions check that <code>idx &lt;= stop</code> (if <code>step &gt;= 0</code>) or <code>idx &gt;= stop</code>
(if <code>step &lt; 0</code>). If true, <code>idx</code> is copied to the <code>ext idx</code> slot (visible
loop variable in the loop body). Then the loop body or the JIT-compiled
trace is entered. Otherwise, the loop is left by continuing with the
next instruction after the <code>*FORL</code>.</p>

<p>The <code>*ITERL</code> instructions check that the first result returned by the
iterator in slot A is non-<code>nil</code>. If true, this value is copied to slot
A-1 and the loop body or the JIT-compiled trace is entered.</p>

<p>The <code>*LOOP</code> instructions are actually no-ops (except for hotspot
detection) and don't branch. Operands A and D are only used by the
JIT-compiler to speed up data-flow and control-flow analysis. The
bytecode instruction itself is needed so the JIT-compiler can patch it
to enter the JIT-compiled trace for the loop.</p>

<h2><a class="anchor" id="function-headers" href="#function-headers"><i class="fa fa-link"></i></a>函数头</h2>

<table>
<tr>
<th width="80"><center>OP</center></th>
<th width="35"><center>A</center></th>
<th colspan="2" width="90"><center>D</center></th>
<th>Description</th>
</tr>
<tr>
<td>FUNCF</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Fixed-arg Lua function</td>
</tr>
<tr>
<td>IFUNCF</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Fixed-arg Lua function, force interpreter</td>
</tr>
<tr>
<td>JFUNCF</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>Fixed-arg Lua function, JIT-compiled</td>
</tr>
<tr>
<td>FUNCV</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Vararg Lua function</td>
</tr>
<tr>
<td>IFUNCV</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Vararg Lua function, force interpreter</td>
</tr>
<tr>
<td>JFUNCV</td>
<td>rbase</td>
<td colspan="2">lit</td>
<td>Vararg Lua function, JIT-compiled</td>
</tr>
<tr>
<td>FUNCC</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Pseudo-header for C functions</td>
</tr>
<tr>
<td>FUNCCW</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Pseudo-header for wrapped C functions</td>
</tr>
<tr>
<td>FUNC*</td>
<td>rbase</td>
<td colspan="2"></td>
<td>Pseudo-header for fast functions</td>
</tr>
</table>

<p>Operand A holds the frame size of the function. Operand D holds the
trace-number for <code>JFUNCF</code> and <code>JFUNCV</code>.</p>

<p>For Lua functions, omitted fixed arguments are set to <code>nil</code> and excess
arguments are ignored. Vararg function setup involves creating a special
vararg frame that holds the arguments beyond the fixed arguments. The
fixed arguments are copied up to a regular Lua function frame and their
slots in the vararg frame are set to <code>nil</code>.</p>

<p>The <code>FUNCF</code> and <code>FUNCV</code> instructions set up the frame for a fixed-arg or
vararg Lua function and do hotspot detection. Trace recording is
triggered if the function is executed often enough.</p>

<p>The <code>IFUNCF</code> and <code>IFUNCV</code> instructions are used by the JIT-compiler to
blacklist functions that cannot be compiled. They don't do hotspot
detection and force execution in the interpreter.</p>

<p>The <code>JFUNCF</code> and <code>JFUNCV</code> instructions enter a JIT-compiled trace after
the initial setup.</p>

<p>The <code>FUNCC</code> and <code>FUNCCW</code> instructions are pseudo-headers pointed to by
the <code>pc</code> field of C closures. They are never emitted and are only used
for dispatching to the setup code for C function calls.</p>

<p>All higher-numbered bytecode instructions are used as pseudo-headers for
fast functions. They are never emitted and are only used for dispatching
to the machine code for the corresponding fast functions.</p>

<h1><a class="anchor" id="luajit-2-0-bytecode-dump-format" href="#luajit-2-0-bytecode-dump-format"><i class="fa fa-link"></i></a>LuaJIT 2.0 Bytecode Dump Format</h1>

<p>Details for the bytecode dump format can be found in <code>src/lj_bcdump.h</code>
in the LuaJIT source code. Here's the concise format description:</p>

<pre class="highlight"><code>dump   = header proto+ 0U
header = ESC 'L' 'J' versionB flagsU [namelenU nameB*]
proto  = lengthU pdata
pdata  = phead bcinsW* uvdataH* kgc* knum* [debugB*]
phead  = flagsB numparamsB framesizeB numuvB numkgcU numknU numbcU
         [debuglenU [firstlineU numlineU]]
kgc    = kgctypeU { ktab | (loU hiU) | (rloU rhiU iloU ihiU) | strB* }
knum   = intU0 | (loU1 hiU)
ktab   = narrayU nhashU karray* khash*
karray = ktabk
khash  = ktabk ktabk
ktabk  = ktabtypeU { intU | (loU hiU) | strB* }

B = 8 bit, H = 16 bit, W = 32 bit, U = ULEB128 of W, U0/U1 = ULEB128 of W+1</code></pre>