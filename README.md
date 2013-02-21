# jQuery.flexa.js
HTMLエレメントベースのアニメーションを構築するjQueryプラグインです。アニメーションの設定はHTMLのdata-*要素で行います。シーン1枚ごとにエフェクトや時間の調整ができます。

## demos
* (Simple)[http://demos.s-uni.net/flexa/]
* (Individual settings)[http://demos.s-uni.net/flexa/individual.html]
* (Wait)[http://demos.s-uni.net/flexa/wait.html]
* (Duration)[http://demos.s-uni.net/flexa/duration.html]
* (Easing)[http://demos.s-uni.net/flexa/easing.html]
* (Transtion)[http://demos.s-uni.net/flexa/transition.html]
* (Timing)[http://demos.s-uni.net/flexa/timing.html]

## installation
jquery.jsの後にjquery.flexa.jsを読み込みます。  
Load jquery.buildSlideshow.js after loading jquery.js.

    <script src="/path/to/jquery.js"></script>
    <script src="/path/to/jquery.flexa.js"></script>

## Simplest usage

### html
HTMLはシンプルな親子構造にします。親要素がアニメーションのフレームとなり、子要素が各シーンとなります。親要素にはflexaを適応するための目印となるdata-flexa-enable="true"を設定します。

    <ol id="Flexa" data-flexa-enable="true">
        <li>Slide 1</li>
        <li>Slide 2</li>
        <li>Slide 3</li>
    </ol>

例はol > liとしてマークアップしていますが、任意の要素でかまいません。

### css
サイズを指定します。また、親要素はstatic以外のポジションを設定し、overflow:hidden;を設定します。これは子要素がposition: absolute;としてアニメーションするためです。

    #Flexa {
        position: relative;
        overflow: hidden;
    }
    #Flexa,
    #Flexa li {
        width: 640px;
        height: 480px;
    }

以上でデフォルトの状態でアニメーションが実行されます。

## Settings
設定をする場合は要素にdata-*属性で指定していきます。それぞれの内容は後述します。

### Global
親要素に設定すると、子要素すべてのシーンがその設定で切り替わります。

    <ol id="Flexa"
        data-duration="3000"
        data-transition="fade"
        data-timing="cross">
        <li>Slide 1</li>
        <li>Slide 2</li>
        <li>Slide 3</li>
    </ol>

### Individual
子要素に設定すると、その子要素だけの設定を行うことができます。

    <ol id="Flexa"
      data-duration="3000"
      data-transition="fade"
      data-timing="cross">
        <li data-duration="1000">Slide 1</li>
        <li data-transtion="left">Slide 2</li>
        <li data-timing="sequence">Slide 3</li>
    </ol>

## options
設定できるオプションは以下のとおりです。設定の際はdata-*属性と指定します。例として、loopオプションを設定したい場合は以下のようになります。

    <ol data-loop="false">

### Play settings
再生方法に関する設定です。以下の設定は親要素でのみ有効です。

* autoplay
* loop

#### autoplay
自動的に再生を始めるかどうかを設定します。有効な場合、windowのloadイベントで再生が開始されます。

##### value
* true
* false

default:true

#### loop
ループ再生をするかどうか指定します。

##### value
* true
* false

default:true

### Scene settings
シーンの切り替えについての設定です。親要素、子要素どちらでも設定できます。

* wait
* duration
* in-duration
* out-duration
* transition
* in-transition
* out-transition
* easing
* in-easing
* out-easing
* timing
* delay

#### wait
ひとつのシーンが表示されている時間を設定します。単位はミリ秒です。

##### value
* Number

default: 3000

#### duration
シーンが現れるときと消えるときにかかる時間を設定します。単位はミリ秒です。

##### value
* Number

default: 1000

#### in-duration
シーンが現れるときの時間を設定します。単位はミリ秒です。durationの設定はin-durationで上書きされます。

##### value
* Number

default: 設定なし(null)

#### out-duration
シーンが消えるときの時間を設定します。単位はミリ秒です。durationの設定はout-durationで上書きされます。

##### value
* Number

default: 設定なし(null)

#### transition
シーンが現れるときと消えるときのエフェクトを設定します。複数指定して組み合わせることもできます。複数設定するときはスペースで区切ります。複数設定の際は後ろにあるものが優先されます。

##### value
* left  
左から現れ、左へ消えます
* right  
右から現れ、右へ消えます
* top  
上から現れ、上へ消えます
* bottom  
下から現れ、下へ消えます
* fade  
フェードイン、フェードアウトします
* none  
なにもしません。突然現れて、突然消えます。

default: fade

#### in-transition
シーンが現れるときのエフェクトを指定します。複数指定して組み合わせることもできます。複数設定するときはスペースで区切ります。複数設定の際は後ろにあるものが優先されます。transitionの設定はin-transitionで上書きされます。

##### value
* left  
左から現れます。
* right  
右から現れます。
* top  
上から現れます。
* bottom  
下から現れます。
* fade  
フェードインします。
* none  
なにもしません。突然現れます。

default: 設定なし(null)

#### out-transition
シーンが消えるときのエフェクトを指定します。複数指定して組み合わせることもできます。複数設定するときはスペースで区切ります。複数設定の際は後ろにあるものが優先されます。transitionの設定はout-transitionで上書きされます。

##### value
* left  
左へ消えます。
* right  
右へ消えます。
* top  
上へ消えます。
* bottom  
下へ消えます。
* fade  
フェードアウトします。
* none  
なにもしません。突然消えます。

default: 設定なし(null)

#### out-hidden

##### value
* true  
画面外へ消えた後、display:noneになります。(シーンにjQueryのhideを実行します。)
* false  
画面外へ消えた後、特に何もしません。out-transitionのnoneと組み合わせて、シーンを重ねていったり、最後のシーンを表示したままにしたりできます。

default: true

#### easing

##### value
* linear
* swing
* (カスタム設定)

default: linear

#### in-easing

##### value
* linear
* swing
* (カスタム設定)

default: 設定なし(null)

#### out-easing

##### value
* linear
* swing
* (カスタム設定)

default: 設定なし(null)

#### in-timing

##### value
* cross
* sequence
* same

default: cross

#### in-delay
設定した時間だけ切り替わり始めを遅らせます。単位はミリ秒です。

##### value
* Number

default: 0