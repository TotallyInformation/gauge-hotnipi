# gauge-hotnipi
A nice looking gauge W3C component gifted by hotnipi for use with Node-RED, uibuilder and other uses

## Installation

If using with UIBUILDER for Node-RED, simply use UIBUILDER's library manager to install `totallyinformation/gauge-hotnipi`, you can then reference the component in your HTML with `<script src="../uibuilder/vendor/gauge-hotnipi/gauge-hotnipi.iife.min.js"></script>`. If placing the link in your HTML `<head>` with the other uibuilder links, don't forget to add the `defer` attribute so that it loads in the correct order.

If using with the Node-RED Dashboard, you will need to copy the `gauge-hotnipi.iife.min.js` file to a location that Node-RED will make available over its user-facing web server. For example, you can configure a static folder in Node-RED's `settings.js` file.

For use with other platforms, please refer to your platform documentation as to how to make resources available to the front-end.

## HTML Attributes
 
* "min" - (number, mandatory) min value
* "max" - (number, mandatory) max value
* "shape" - (string, optional) shape of the gauge. "round" makes gauge round shape and removes rivets, "rect" is default
* "platehue" - (number, optional) for dark theme, the plate color hue can be changed
* "multiplier" - (number, optional) multiplier for all values. scale numbers and value are divided by that, gauge shows multiplier on plate (fe: x100)
* "measurement" - (string, optional) the name of the measurement (temperature, humidity ...)
* "unit" - (string, optional) the unit of the measurement
* "rivets" - (boolean, optional) show/hide rivets. defaults to true
* "digits" - (json string, optional) size and placement of the scale digits.  '{"size":100,"distance":14}' size is treated as percentage, distance is arbitrary number around 15.
* "led" - (boolean, optional) shows small led which blinks couple of times when update is received.
* "zones" - (json string, optional) configuration of zones. An array of objects where:
 
  * "type" (string) - color choice. acceptable values "low", "normal", "warn", "high"
  * "cover" (number) - size of zone. acceptable values 1, 2 3. (1 covers space between major ticks)
  * "rotate" (number) - to find correct value, try with 0 and manually rotate to desired position using browser developer tools. When position found, adjust the code.
  * "size" - (CSS size string) - Optional. Defines the outer size (width/height). If supplied, no outer div is required to set the size. If omitted, the outer elements must set a size somewhere.

## Overridable CSS

The following CSS variables can be used to override the defaults.

```css
--needle-color
--zone-color-high
--zone-color-warn
--zone-color-normal
--zone-color-low
```

Also - originally from the [UIBUILDER uib-brand.css](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/front-end/uib-brand.css):

```css
/* Background colours */
--surface1, --surface2, --surface3, --surface4, --surface5
/* Text colour */
--text3
```

## Example - Change attributes in JavaScript

Forces a redraw.
 
```js
document.getElementById('gauge').setAttribute('digits',JSON.stringify({size:80,distance:15}))
document.getElementById('gauge').setAttribute('max',1200)
```

## Example - Node-RED Dashboard

Add this to a `ui_template` node:

```html
<script src="/js/gauge-hotnipi.js"></script>
<template>
    <gauge-hotnipi ref="hotgauge" min="0" max="100" size="180px" platehue="220" digits='{"size":80,"distance":14}'></gauge-hotnipi>
</template>

<script>
    export default {
        methods: {
            getElement: function(name,base){
                if(base){
                    return this.$refs[name][0]                    
                }
                return this.$refs[name]                
            }
        },
        
        watch: {
            msg: function(){
                if(this.msg.payload != undefined){
                    this.getElement("hotgauge").update(this.msg.payload)                    
                }
            }
        }
    }
</script>
```

## References

* Node-RED Forum

  * https://discourse.nodered.org/t/new-w3c-gauge-component-gifted-to-the-community-by-hotnipi/78557
  * https://discourse.nodered.org/t/showing-gauges-in-uibuilder/78473/3
  * https://discourse.nodered.org/t/dashboard-2-0-is-now-generally-available/84913/73?u=totallyinformation
