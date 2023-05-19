/** W3C Component version of hotnipi's gauge
 * Gifted to TotallyInformation by hotnipi for use with uibuilder.
 * But can be used anywhere that supports W3C vanilla components.
 *
 * attributes:
 *   "min" - (number, mandatory) min value
 *   "max" - (number, mandatory) max value
 *   "shape" - (string, optional) shape of the gauge. "round" makes gauge round shape and removes rivets, "rect" is default
 *   "platehue" - (number, optional) for dark theme, the plate color hue can be changed
 *   "multiplier" - (number, optional) multiplier for all values. scale numbers and value are divided by that, gauge shows multiplier on plate (fe: x100)
 *   "measurement" - (string, optional) the name of the measurement (temperature, humidity ...)
 *   "unit" - (string, optional) the unit of the measurement
 *   "rivets" - (boolean, optional) show/hide rivets. defaults to true
 *   "digits" - (json string, optional) size and placement of the scale digits.  '{"size":100,"distance":14}' size is treated as percentage, distance is arbitrary number around 15.
 *   "led" - (boolean, optional) shows small led which blinks couple of times when update is received.
 *   "zones" - (json string, optional) configuration of zones. An array of objects where:
 *      "type" (string) - color choice. acceptable values "low", "normal", "warn", "high"
 *      "cover" (number) - size of zone. acceptable values 1, 2 3. (1 covers space between major ticks)
 *      "rotate" (number) - to find correct value, try with 0 and manually rotate to desired position using browser developer tools. When position found, adjust the code.
 *   "size" - (CSS size string) - Optional. Defines the outer size (width/height). If supplied, no outer div is required to set the size. If omitted, the outer elements must set a size somewhere.
 *
 *   All attributes can be changed at runtime, forces redraw.
 *
 *   fe:
 *   document.getElementById('gauge').setAttribute('digits',JSON.stringify({size:80,distance:15}))
 *   document.getElementById('gauge').setAttribute('max',1200)
 *
 * CHANGELOG:
 * - Wrap component as per other uibuilder components
 * - Move styles to the template
 * - Define class variables directly, rename this.size to this.width to more accurately reflect the content
 * - Add a `size` attribute & config var. Can now use with an outer div setting the size OR supply the size without the outer div
 * - Set gauge element style properties using setProperty directly rather than via a complex (and slow to compute) compound string
 * - Slight adjustments to use of uib-brand standard variables - particularly making the text slightly brighter (--text3 rather than --text2)
 */

const componentName = 'gauge-hotnipi'
const className = 'GaugeHotnipi' // eslint-disable-line no-unused-vars

// just for syntax highlighting in VSCode (requires the lit-html extension)
function html(strings, ...keys) {
    return strings.map((s, i) => {
        return s + (keys[i] || '')
    }).join('')
}

const template = document.createElement('template')
template.innerHTML = html`
    <style>
        :host{           
            --hng-needle-color: var(--needle-color,hsl(1, 74%, 52%));
            --hng-zone-color-high: var(--zone-color-high,hsla(5, 100%, 65%, 0.459));
            --hng-zone-color-warn: var(--zone-color-warn,hsla(39, 100%, 59%, 0.459));
            --hng-zone-color-normal: var(--zone-color-normal,hsla(97, 100%, 65%, 0.333));
            --hng-zone-color-low: var(--zone-color-low,hsla(200, 100%, 65%, 0.522));
            --hng-needle-speed: var(--needle-speed,0.5);
            --hng-plate-hue: 0;
        }
        .g-wrapper {
            display: grid;
            grid-template-rows: 1fr;
            width: 100%;
            height: 100%;
            align-content: center;
            align-items: center;
            justify-items: center;
        }
        .g-wrapper-label-0 .g-container {
            height: calc(100% - 6px);
        }        
        .g-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            width: 100%;
            height: 100%;
        }        
        .g-body {
            position: relative;
            display: flex;
            align-content: center;
            align-items: center;
            justify-content: center;
            height: 98%;
            width: 98%;
            border-radius: 15%;
            box-shadow: 0px 2px 4px 2px #00000030;
            background: linear-gradient(0deg, var(--surface3) 0%, var(--surface4) 99%, var(--surface1) 100%);
            user-select: none;
        }
        .g-round{
            border-radius: 100%;
        }        
        .g-body::before {
            content: '';
            position: absolute;
            top: 0px;
            right: 0px;
            bottom: 0px;
            left: 0px;
            opacity: 0.1;
            border-radius: 15%;    
        }        
        .g-ring {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            align-content: center;
            width: 94%;
            height: 94%;
            border-radius: 50%;
            background: linear-gradient(180deg, var(--surface2) 0%, var(--surface4) 99%, var(--surface5) 100%);
        } 

        .g-plate {
            --plate-hue:var(--hng-plate-hue);
            position: relative;
            overflow: hidden;
            width: 93%;
            height: 93%;
            border-radius: 50%;
            box-shadow: inset 0 0 11px hsl(var(--plate-hue) 67% 56% / 60%);
            background: radial-gradient(circle, hsl(var(--plate-hue), 31%, 17%) 0%, hsl(var(--plate-hue), 20%, 30%) 40%, hsl(var(--plate-hue), 69%, 10%) 100%);
        } 

        @media (prefers-color-scheme: light){
            .g-body {
                box-shadow: 0px 2px 6px 0px #00000020;
            }
            .g-plate {
                background: unset;
                box-shadow: inset 0 0 20px #00000035;
            }
            .g-ring{
                background: linear-gradient(180deg, var(--surface5) 0%, var(--surface2) 99%, var(--surface1) 100%);
            }
        }    
        .g-led{
            position: absolute;
            left:48%;
            top:27%;
            border-radius: 2em;
            width: 0.5em;
            height: 0.5em;
            background-color: hsla(360 100% 50% / 100%);
            box-shadow: 0 0 4px 1px hsl(0, 100%, 25%), inset 0px -5px 6px -3px hsl(360 100% 30%);
            filter:saturate(0.05) brightness(3);        
        }
        .g-led.active{
            animation:blink 0.25s linear ;
            animation-iteration-count: infinite;        
        }
        @keyframes blink{
            50%{filter: none;}
        }
        .g-ticks {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            filter: drop-shadow(2px 4px 6px hsl(0, 0%, 0%));
        }        
        .g-tick {
            position: relative;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            margin-bottom: -1px;
            background: linear-gradient(90deg, hsla(0, 0%, 0%, 0) 0, hsla(0, 0%, 0%, 0) 2%, var(--text3) 2%, var(--text3) 10%, hsla(0, 0%, 0%, 0) 10%);
            transform: rotate(calc(calc(270deg / var(--ga-tick-count)) * var(--ga-tick) - calc(calc(270deg / var(--ga-tick-count)) + 45deg)));
        }        
        .g-tick.clock {
            transform: rotate(calc(calc(360deg / var(--ga-tick-count)) * var(--ga-tick) - calc(calc(360deg / var(--ga-tick-count)) +270deg)));
        }        
        .g-subtick {
            position: relative;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            margin-bottom: -1px;
            background: linear-gradient(90deg, hsla(0, 0%, 0%, 0) 0, hsla(0, 0%, 0%, 0) 2%, var(--text3) 2%, var(--text3) 6%, hsla(0, 0%, 0%, 0) 6%);
            transform: rotate(calc(calc(270deg / var(--ga-subtick-count)) * var(--ga-tick) - calc(calc(270deg / var(--ga-subtick-count)) + 45deg)));
        }   
        .g-subtick.clock {
            transform: rotate(calc(calc(360deg / var(--ga-subtick-count)) * var(--ga-tick) - calc(calc(360deg / var(--ga-subtick-count)) + 270deg)));
        }        
        .g-num {
            position: absolute;
            top: 50%;
            left: 50%;
            text-align: center;
            transform: translate(-50%, -50%) rotate(calc(calc(270deg / var(--ga-tick-count)) * var(--ga-tick) - calc(calc(270deg / var(--ga-tick-count)) + 45deg))) translate(calc(-1px * var(--container-size) * var(--gn-distance))) rotate(calc(calc(270deg / var(--ga-tick-count)) * var(--ga-tick) *-1 - calc(calc(270deg / var(--ga-tick-count))*-1 - 45deg)));
        }        
        .g-num.clock {
            transform: translate(-50%, -50%) rotate(calc(calc(360deg / var(--ga-tick-count)) * var(--ga-tick) - calc(calc(360deg / var(--ga-tick-count)) + 270deg))) translate(calc(-1px * var(--container-size) * var(--gn-distance))) rotate(calc(calc(360deg / var(--ga-tick-count)) * var(--ga-tick) *-1 - calc(calc(360deg / var(--ga-tick-count))*-1 - 270deg)));
        }        
        .g-nums {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            color: var(--text3);
            font-size: calc(var(--digit-size) * 1%);
            font-weight: 500;
            filter: drop-shadow(2px 4px 10px hsl(0, 0%, 0%));
        }        
        .g-needle {
            position: absolute;
            left: 0;
            top: 49%;
            width: 100%;
            height: 2%;
            filter: drop-shadow(0px 1px 3px hsla(0, 0%, 0%, 0.502));
            background: linear-gradient(90deg, hsla(243, 100%, 7%, 0) 0, hsla(0, 0%, 0%, 0) 10%, var(--hng-needle-color) 10%, var(--hng-needle-color) 65%, hsla(0, 0%, 0%, 0) 65%);
            transform: rotate(calc(270deg * calc(var(--gauge-value, 0deg) / 100) - 45deg));
            transition: transform calc(1s * var(--hng-needle-speed));
        }        
        .g-needle-secondary {
            position: absolute;
            left: 0;
            top: 49%;
            width: 100%;
            height: 2%;
            filter: drop-shadow(0px 1px 3px hsla(0, 0%, 0%, 0.502));
            background: linear-gradient(90deg, hsla(243, 100%, 7%, 0) 0, hsla(0, 0%, 0%, 0) 15%, var(--hng-needle-color-secondary) 15%, var(--hng-needle-color-secondary) 50%, hsla(0, 0%, 0%, 0) 50%);
            transform: rotate(calc(270deg * calc(var(--gauge-value-secondary, 0deg) / 100) - 45deg));
            transition: transform  calc(1s * var(--hng-needle-speed));
        }
        .g-needle.hour {
            background: linear-gradient(90deg, hsla(243, 100%, 7%, 0) 0, hsla(0, 0%, 0%, 0) 20%, var(--hng-needle-color) 20%, var(--hng-needle-color) 50%, hsla(0, 0%, 0%, 0) 50%);
            transition: unset;
            transform: rotate(var(--time-hour));
        }        
        .g-needle.minute {
            top: 49.25%;
            height: 1.5%;
            background: linear-gradient(90deg, hsla(243, 100%, 7%, 0) 0, hsla(0, 0%, 0%, 0) 15%, var(--hng-needle-color) 15%, var(--hng-needle-color) 50%, hsla(0, 0%, 0%, 0) 50%);
            transition: unset;
            transform: rotate(var(--time-minute));
        }        
        .g-needle.second {
            top: 49.5%;
            height: 0.5%;
            background: linear-gradient(90deg, hsla(243, 100%, 7%, 0) 0, hsla(0, 0%, 0%, 0) 10%, var(--hng-needle-color) 10%, var(--hng-needle-color) 50%, hsla(0, 0%, 0%, 0) 50%);
            transform: rotate(var(--time-second));
            transition: unset;
        }        
        .g-needle-ring {
            position: absolute;
            width: calc(var(--container-size) * 2.5%);
            height: calc(var(--container-size) * 2.5%);
            top: 50%;
            left: 50%;
            border-radius: 50%;
            box-shadow: 0 1px 4px hsla(0, 0%, 0%, 0.612);
            background: linear-gradient(hsl(0, 0%, 88%), hsl(0, 0%, 71%));
            background: linear-gradient(var(--surface4), var(--surface3));
            transform: translate(-50%, -50%);
        }    
        .g-val {
            position: absolute;
            text-align: center;
            left: 50%;
            bottom: 0%;
            width: 80px;
            font-family: monospace;
            font-size: calc(var(--container-size) * 50%);
            color: var(--text3);
            filter: drop-shadow(2px 3px 2px hsla(0, 0%, 0%, 0.314));
            transform: translateX(-50%);
        }
        .g-val-ring {
            position: absolute;
            right: 0%;
            top: 0%;
            width: calc(calc(var(--container-size) * 7%) / calc(var(--container-size)/4));
            height: calc(calc(var(--container-size) * 6%) / calc(var(--container-size)/4));
            border-radius: 50%;
            background: linear-gradient(180deg, hsl(0, 0%, 31%) 0%, hsl(0, 0%, 84%) 99%, hsl(0, 0%, 93%) 100%);
        }
        .g-val-plate {
            position: absolute;
            right: 0%;
            top: 0%;
            width: 90%;
            height: 90%;
            border-radius: 50%;
            background: hsl(210, 23%, 91%);
            box-shadow: inset 0 0 15px hsla(0, 0%, 0%, 0.639);
            transform: translate(-5%, 5%);
        }
        .g-text {
            position: absolute;
            left: 50%;           
            width: 100%;
            font-family: monospace;
            font-size: calc(var(--container-size) * 20%);
            text-align: center;
            color: var(--text3);
            filter: drop-shadow(2px 3px 2px hsla(0, 0%, 0%, 0.502));
            transform: translateX(-50%);
        }        
        .g-label {
            top: 35%;
        }
        .g-unit {
            top: 62%;
        }
        .g-multi{
            top: 69%;
            font-size: calc(var(--container-size) * 27%);
        }        
        .g-rivets {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }        
        .g-rivet {
            position: absolute;
            width: 4%;
            height: 4%;
            border: 1px solid hsla(0, 0%, 100%, 0.1);
            border-radius: 50px;
            box-shadow: 0px 2px 4px hsla(0, 0%, 0%, 0.596), -1px -1px 5px hsla(0, 0%, 0%, 0.2);           
        }        
        .g-rivet:nth-child(1) {
            top: 3%;
            left: 3%;
        }        
        .g-rivet:nth-child(2) {
            top: 3%;
            right: 3%;
        }        
        .g-rivet:nth-child(3) {
            bottom: 3%;
            left: 3%;
        }        
        .g-rivet:nth-child(4) {
            bottom: 3%;
            right: 3%;
        }
        .g-zone {
            position: absolute;
            width: 48%;
            height: 48%;
            top: 2%;
            left: 50%;
            box-sizing: border-box;
            border-radius: 0 100% 0 0;
            border-color: var(--hng-zone-color-normal);
            border-top: calc(var(--container-size) * 2.5px) solid;
            border-right: calc(var(--container-size) * 2.5px) solid;
            transform-origin: bottom left;
        }        
        .g-zone-1 {
            clip-path: polygon(0% 0%, 100% 0%, 50% 0%, 0% 100%);
        }
        .g-zone-2 {
            clip-path: polygon(0% 0%, 100% 0%, 100% 25%, 0% 100%);
        }
        .g-zone-3 {
            clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%)
        }
        .g-zone.high {
            border-color: var(--hng-zone-color-high);  
        }        
        .g-zone.warn {
            border-color: var(--hng-zone-color-warn);  
        }        
        .g-zone.normal {
            border-color: var(--hng-zone-color-normal);  
        }        
        .g-zone.low {
            border-color: var(--hng-zone-color-low);
        }
    </style>
`

class GaugeHotnipi extends HTMLElement {

    //#region ---- Class Variables ----
    config = {
        /** Minimum scale number */
        min: 0,
        /** Maximum scale number */
        max: 100,
        /** @type {"rect"|"round"} Gauge shape */
        shape: 'rect',
        /** Show the corner "rivets" */
        rivets: true,
        /** Show the indicator LED - lights when a value is received */
        led: true,
        /** @type {Array<number>} */
        scales: [],
        measurement: '',
        unit: '',
        multiplier: 0,
        digits: { size: 100, distance: 14 },
        zones: [],
        platehue: 0,
        /** Default width/height - CSS specification */
        size: '100%',
    }

    /** @type {number|undefined} The previous value of the gauge */
    lastValue
    /** @type {number|undefined} The width of the bounding rectangle of the gauge object */
    width
    //#endregion ---- ---- -----

    constructor() {
        super()

        const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
        shadow.append(template.content.cloneNode(true))

        this.dispatchEvent(new Event(`${componentName}:construction`, { bubbles: true, composed: true }))

        this.wrapper = document.createElement('div')
        shadow.appendChild(this.wrapper)
    }

    static get observedAttributes() {
        return ['min', 'max', 'shape', 'multiplier', 'measurement', 'unit', 'rivets', 'digits', 'led', 'zones', 'platehue', 'size']
    }

    connectedCallback() {
        this.draw()
    }

    // TODO: Improve attribute error logs
    attributeChangedCallback(name, from, to) {
        if (from !== to) { // eslint-disable-line sonarjs/no-collapsible-if
            if (Object.prototype.hasOwnProperty.call(this.config, 'name')) {
                switch (name) {
                    case 'min': {
                        to = parseFloat(to)
                        if (isNaN(to)) {
                            to = 0
                        }
                        break
                    }
                    case 'max': {
                        to = parseFloat(to)
                        if (isNaN(to)) {
                            to = 100
                        }
                        break
                    }
                    case 'platehue': {
                        // If a string passed as the hue, attempt to calculate the actual value.
                        // Allows for internal and external css variables to be used.
                        console.log(isNaN(to), getComputedStyle(document.body).getPropertyValue(to))
                        if (isNaN(to)) {
                            const hue = getComputedStyle(document.body).getPropertyValue(to)
                            if (hue === '') to = this.config.platehue
                            else to = hue
                        }
                        break
                    }
                    case 'multiplier': {
                        to = parseFloat(to)
                        if (isNaN(to) || to === 0) {
                            to = false
                        }
                        break
                    }
                    case 'led':
                    case 'rivets': {
                        to = to === 'true' ? true : false // eslint-disable-line no-unneeded-ternary
                    }
                    case 'digits': { // eslint-disable-line no-fallthrough
                        try {
                            to = JSON.parse(to)
                        }
                        catch (error) {
                            console.log(error)
                            to = this.config.digits
                        }
                        break
                    }
                    case 'zones': {
                        try {
                            to = JSON.parse(to)
                        } catch (error) {
                            console.warn(error, to)
                            to = this.config.zones
                        }
                        break
                    }
                    default:
                        break
                }
                this.config[name] = to
            }
        }

        this.draw()
        if (this.lastValue) {
            this.update(this.lastValue)
        }
    }

    /** Draws the gauge into the DOM */
    draw() {

        // scales from min - max
        const gap = ((this.config.max - this.config.min) / 10)
        let n = this.config.min
        this.config.scales = []
        const use = this.config.multiplier
        for (let i = 0; i < 11; ++i) {
            this.config.scales.push(n)
            n = parseFloat((n + gap).toFixed(2))
        }
        if (use && use !== 0) {
            this.config.scales = this.config.scales.map(n => parseFloat((n / use).toFixed(2)))
        }

        // clear
        this.wrapper.replaceChildren()

        // init wrapper
        this.wrapper.style.width = this.config.size
        this.wrapper.style.height = this.config.size
        this.wrapper.style.position = 'relative'
        this.width = this.wrapper.getBoundingClientRect().width

        // create gauge
        this.gauge = document.createElement('div')

        // this.gauge.setAttribute("style", "--gauge-value:0;--container-size:" + this.width / 50 + ";--gn-distance:" + this.config.digits.distance + ";--digit-size:" + this.config.digits.size + ";--ga-tick-count:10;--ga-subtick-count:100;--hng-plate-hue:" + this.config.platehue + ";");
        this.gauge.setAttribute('style', '--gauge-value:0;--ga-tick-count:10;--ga-subtick-count:100;')
        this.gauge.style.width = '100%'
        this.gauge.style.setProperty('height', '100%')
        this.gauge.style.setProperty('--container-size', this.width / 50)
        this.gauge.style.setProperty('--gn-distance', this.config.digits.distance)
        this.gauge.style.setProperty('--digit-size', this.config.digits.size)
        this.gauge.style.setProperty('--hng-plate-hue', this.config.platehue)
        this.gauge.style.setProperty('--plate-hue', this.config.platehue)

        // body
        const body = document.createElement('div')
        body.className = 'g-body'
        if (this.config.shape === 'round') {
            body.classList.add('g-round')
        }
        this.gauge.appendChild(body)

        // ring
        const ring = document.createElement('div')
        ring.className = 'g-ring'
        body.appendChild(ring)

        // rivets
        if (this.config.rivets && this.config.shape === 'rect') {
            const rivets = document.createElement('div')
            rivets.className = 'g-rivets'
            ring.appendChild(rivets)
            for (let i = 0; i < 4; ++i) {
                const rivet = document.createElement('div')
                rivet.className = 'g-rivet'
                rivets.appendChild(rivet)
            }
        }

        // plate
        const plate = document.createElement('div')
        plate.className = 'g-plate'
        ring.appendChild(plate)

        // zones
        if (this.config.zones.length > 0) {
            let zone, cl
            this.config.zones.forEach(z => {
                zone = document.createElement('div')
                cl = 'g-zone '
                cl += 'g-zone-' + z.cover + ' '
                cl += z.type
                zone.className = cl
                zone.style.rotate = z.rotate + 'deg'
                plate.appendChild(zone)
            })
        }

        // led
        if (this.config.led) {
            this.led = document.createElement('div')
            this.led.className = 'g-led'
            plate.appendChild(this.led)
        }

        // ticks
        const ticks = document.createElement('div')
        ticks.className = 'g-ticks'
        plate.appendChild(ticks)

        for (let i = 1; i < 12; i++) {
            const tick = document.createElement('div')
            tick.className = 'g-tick'
            tick.setAttribute('style', '--ga-tick:' + i)
            ticks.appendChild(tick)
        }

        for (let i = 2; i < 101; i++) {
            const is = i.toString()
            if (is.charAt(is.length - 1) === '1') {
                continue
            }
            const tick = document.createElement('div')
            tick.className = 'g-subtick'
            tick.setAttribute('style', '--ga-tick:' + i)
            ticks.appendChild(tick)
        }

        // numbers

        const numbers = document.createElement('div')
        numbers.className = 'g-nums'
        plate.appendChild(numbers)
        for (let i = 1; i < 12; i++) {
            const num = document.createElement('div')
            num.className = 'g-num'
            num.setAttribute('style', '--ga-tick:' + i)
            num.textContent = (this.config.scales[i - 1]).toString()
            numbers.appendChild(num)
        }

        // measurement field
        if (this.config.measurement) {
            const label = document.createElement('div')
            label.className = 'g-text g-label'
            label.textContent = this.config.measurement
            plate.appendChild(label)
        }

        // unit
        if (this.config.unit) {
            const label = document.createElement('div')
            label.className = 'g-text g-unit'
            label.textContent = this.config.unit
            plate.appendChild(label)
        }
        // multiplier
        if (this.config.multiplier) {
            const label = document.createElement('div')
            label.className = 'g-text g-multi'
            label.textContent = 'x' + this.config.multiplier
            plate.appendChild(label)
        }

        // needle
        const needle = document.createElement('div')
        needle.className = 'g-needle'
        plate.appendChild(needle)

        const needleRing = document.createElement('div')
        needleRing.className = 'g-needle-ring'
        plate.appendChild(needleRing)

        // valueField
        this.valueField = document.createElement('div')
        this.valueField.className = 'g-val'
        plate.appendChild(this.valueField)

        this.wrapper.appendChild(this.gauge)

    }

    removeBlink() {
        this.led.classList.remove('active')
        this.delay = null
    }

    update(value) {
        this.lastValue = value
        if (!this.valueField) {
            return
        }

        const t = this.config.multiplier ? (value / this.config.multiplier).toFixed(1) : value.toFixed(1)
        this.valueField.textContent = t
        const v = ((value - this.config.min) / (this.config.max - this.config.min)) * 100
        this.gauge.style.setProperty('--gauge-value', v)

        // blink led
        if (this.config.led) {
            if (this.delay != null) {
                clearTimeout(this.delay)
                this.removeBlink()
            }
            this.led.classList.add('active')
            this.delay = setTimeout(() => this.removeBlink(), 800)
        }
    }
}

// Self-register the HTML tag
customElements.define(componentName, GaugeHotnipi)
