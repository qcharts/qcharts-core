(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{149:function(s,t,a){"use strict";a.r(t);var n={components:{}},r=a(0),e=Object(r.a)(n,(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("section",[a("h2",[s._v("刻度")]),s._v(" "),s._m(0),s._v(" "),a("block-demo",{attrs:{tip:"",source:"const data = [\n  {\n    value: 7.3\n  }\n]\n\nconst { Chart, Gauge, Legend, Tooltip } = qcharts\n\nconst chart = new Chart({ container: '#app' })\n\nchart.source(data, {\n  value: 'value'\n})\n\nconst colors = ['#49d088', '#FE5555', '#F4B30E', '#473C8B']\n\nconst gauge = new Gauge({\n  min: 0,\n  max: 10,\n  tickStep: 1,\n  tickLength: -10,\n  title: d => `${d.value}`,\n  subTitle: 'Hello'\n})\n\ngauge.style('title', { fontSize: 36 })\n\nchart.add(gauge)\n\nchart.render()\n"}},[a("pre",{pre:!0},[a("code",{pre:!0,attrs:{"v-pre":"",class:"language-javascript"}},[a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" data = [\n  {\n    "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("value")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("7.3")]),s._v("\n  }\n]\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" { Chart, Gauge, Legend, Tooltip } = qcharts\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" chart = "),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("new")]),s._v(" Chart({ "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("container")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#app'")]),s._v(" })\n\nchart.source(data, {\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("value")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'value'")]),s._v("\n})\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" colors = ["),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#49d088'")]),s._v(", "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#FE5555'")]),s._v(", "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#F4B30E'")]),s._v(", "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#473C8B'")]),s._v("]\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" gauge = "),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("new")]),s._v(" Gauge({\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("min")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("0")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("max")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("10")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("tickStep")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("1")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("tickLength")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("-10")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("title")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-function"}},[a("span",{pre:!0,attrs:{class:"hljs-params"}},[s._v("d")]),s._v(" =>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("`"),a("span",{pre:!0,attrs:{class:"hljs-subst"}},[s._v("${d.value}")]),s._v("`")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("subTitle")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'Hello'")]),s._v("\n})\n\ngauge.style("),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'title'")]),s._v(", { "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("fontSize")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("36")]),s._v(" })\n\nchart.add(gauge)\n\nchart.render()\n")])])]),a("h3",[s._v("刻度上文字")]),s._v(" "),s._m(1),s._v(" "),a("block-demo",{attrs:{tip:"",source:"const data = [\n  {\n    value: 7.3\n  }\n]\n\nconst { Chart, Gauge, Legend, Tooltip } = qcharts\n\nconst chart = new Chart({ container: '#app' })\n\nchart.source(data, {\n  value: 'value'\n})\n\nconst gauge = new Gauge({\n  min: 0,\n  max: 10,\n  tickStep: 1,\n  tickLength: 10,\n  labelOffset: 20,\n  title: d => `${d.value}`,\n  subTitle: 'Hello'\n})\n\ngauge.style('title', { fontSize: 36 })\n\nchart.add(gauge)\n\nchart.render()\n"}},[a("pre",{pre:!0},[a("code",{pre:!0,attrs:{"v-pre":"",class:"language-javascript"}},[a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" data = [\n  {\n    "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("value")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("7.3")]),s._v("\n  }\n]\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" { Chart, Gauge, Legend, Tooltip } = qcharts\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" chart = "),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("new")]),s._v(" Chart({ "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("container")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'#app'")]),s._v(" })\n\nchart.source(data, {\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("value")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'value'")]),s._v("\n})\n\n"),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("const")]),s._v(" gauge = "),a("span",{pre:!0,attrs:{class:"hljs-keyword"}},[s._v("new")]),s._v(" Gauge({\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("min")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("0")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("max")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("10")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("tickStep")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("1")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("tickLength")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("10")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("labelOffset")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("20")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("title")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-function"}},[a("span",{pre:!0,attrs:{class:"hljs-params"}},[s._v("d")]),s._v(" =>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("`"),a("span",{pre:!0,attrs:{class:"hljs-subst"}},[s._v("${d.value}")]),s._v("`")]),s._v(",\n  "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("subTitle")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'Hello'")]),s._v("\n})\n\ngauge.style("),a("span",{pre:!0,attrs:{class:"hljs-string"}},[s._v("'title'")]),s._v(", { "),a("span",{pre:!0,attrs:{class:"hljs-attr"}},[s._v("fontSize")]),s._v(": "),a("span",{pre:!0,attrs:{class:"hljs-number"}},[s._v("36")]),s._v(" })\n\nchart.add(gauge)\n\nchart.render()\n")])])])],1)}),[function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("可以通过 "),t("code",{pre:!0},[this._v("tickStep")]),this._v(" 和 "),t("code",{pre:!0},[this._v("tickLength")]),this._v(" 分别控制 tick 的生成数和长度。当 "),t("code",{pre:!0},[this._v("tickLength")]),this._v(" 为负值时，将在外圈绘制刻度。")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("可以通过 "),t("code",{pre:!0},[this._v("labelOffset")]),this._v(" 设置文字和刻度之间的距离。")])}],!1,null,null,null);t.default=e.exports}}]);