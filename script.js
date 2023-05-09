// Slider that updates the visualisation
var slider = d3
    .sliderHorizontal()
    .min(1)
    .max(3)
    .step(1)
    .ticks(2)
    .tickFormat(d3.format(',.0f'))
    .width(450)
    .displayValue(false)
    .on('onchange', (val) => {
        updateVisualisation(val)
    });

// d3.select('#slider>svg')
//     .append('g')
//     .attr('transform', 'translate(30,30)')
//     .call(slider);

// Data generator
function randomXY(n, width, height, scale) {

    let tmp = {
        x: Array.from({ length: n }, d3.randomNormal(width / 2, width / 2 / scale)),
        y: Array.from({ length: n }, d3.randomNormal(height / 2, height / 2 / scale))
    }

    let xy = tmp.x.map((v, i) => ({ x: Math.floor(v), y: Math.floor(tmp.y[i]) }))

    return xy

}

// Visualisation 1
function visualisation_1(svg) {

    let width = svg.attrs.width,
        height = svg.attrs.height,
        margin = svg.attrs.margin


    let data = randomXY(50, width, height, 4),
        xScale = d3.scaleLinear().domain([0, width]).range([0, width]),
        yScale = d3.scaleLinear().domain([0, height]).range([height, 0]),
        needs_initial_g = d3.select('g#circles').empty(),
        currentViz = svg.attr('viz')

    d3.select('#text').text('Here are some dots that represent people')

    if (needs_initial_g) {
        circleInitialiser()
    }

    if (currentViz !== '2') {
        circlePositioner()
    }

    if (currentViz == '2') {
        barShrinker(circlePositioner)
    }

    // 
    function circleInitialiser() {
        svg.append('g')
            .attr("id", 'circles')
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", () => width / 2)
            .attr("cy", () => height / 2)
            .attr('transform', `translate(${margin}, ${margin})`)
    }

    function barShrinker(callback) {

        svg.select('#vbars')
            .selectAll("rect")
            .transition()
            .duration(500)
            .attr("y", (d) => yScale(0))
            .attr("height", d => height - yScale(0))
            .on('end', callback)

        svg.select('#vbars-xscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${height + 2 * margin})`)

        svg.select('#vbars-yscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(-${2 * margin},${margin})`)

    }

    function circlePositioner() {

        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(500)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)
            .style("fill", "#CC0000")

        svg.attr('viz', '1')
    }
}

function visualisation_2(svg) {

    let width = svg.attrs.width,
        height = svg.attrs.height,
        margin = svg.attrs.margin

    // Histogram vertical
    let data = randomXY(50, width, height, 5),
        data2 = [{ x: 1, y: 150 }, { x: 2, y: 250 }, { x: 3, y: 250 }, { x: 4, y: 350 }, { x: 5, y: 250 }],
        ngroups = data2.length,
        needs_initial_g = d3.select('g#vbars').empty(),
        currentViz = svg.attr('viz')

    for (i in data) { data[i].x = d3.randomInt(1, ngroups + 1)() }

    d3.select('#text')
        .text('Now they are summarised vertically')

    if (needs_initial_g) {
        barInitialiser()
    }

    if (currentViz == '1') {
        circleShrinker(barGrower)
    }

    if (currentViz == '3') {
        barShrinker(() => {
            circleShrinker(() => {
                barGrower()
            })
        })

    }

    function barInitialiser() {

        let xScale = d3.scaleBand().domain(data2.map(d => d.x)).range([0, width]).padding(0.4),
            yScale = d3.scaleLinear().domain([0, height]).range([height, 0])

        svg.append('g')
            .attr("id", 'vbars')
            .selectAll()
            .data(data2)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d.x))
            .attr("width", xScale.bandwidth())
            .attr("y", (d) => yScale(0))
            .attr("height", d => height - yScale(0))
            .attr('transform', `translate(${margin}, ${margin})`)

        svg.append("g")
            .attr('id', 'vbars-xscale')
            .attr("transform", `translate(${margin},${height + 2 * margin})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
        //.attr("transform", "translate(-10,0)rotate(-45)")
        //.style("text-anchor", "end");

        svg.append("g")
            .attr('id', 'vbars-yscale')
            .attr("transform", `translate(-${2 * margin},${margin})`)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
    }

    function circleShrinker(callback) {

        let yScale = d3.scaleLinear().domain([0, height]).range([height, 0]),
            xScale = d3.scaleBand().domain(data2.map(d => d.x)).range([0, width]).padding(0.4),
            xScaleBandwith = xScale.bandwidth()

        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(500)
            .attr("cx", d => xScale(d.x) + xScaleBandwith / 2)
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)
            .style('fill', 'green')
            .transition()
            .duration(750)
            .attr("cy", d => yScale(-(xScaleBandwith / 2) - margin))
            .attr('r', xScaleBandwith / 2)
            .on('end', callback)
    }

    function barGrower() {

        let yScale = d3.scaleLinear().domain([0, height]).range([height, 0])

        svg.select('#vbars')
            .selectAll('rect')
            .data(data2)
            .transition()
            .duration(500)
            .attr("y", (d) => yScale(d.y))
            .attr("height", d => height - yScale(d.y))
            .attr("fill", "green")

        svg.select('#vbars-xscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${height + margin})`)

        svg.select('#vbars-yscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${margin})`)

        svg.attr('viz', '2')
    }

    function barShrinker(callback) {

        svg.select('#hbars')
            .selectAll('rect')
            .transition()
            .duration(500)
            .attr('width', () => 0)
            .on('end', callback)

            svg.select('#hbars-xscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${height + 2 * margin})`)

        svg.select('#hbars-yscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(-${2 * margin},${margin})`)

    }
}

function visualisation_3(svg) {

    let width = svg.attrs.width,
        height = svg.attrs.height,
        margin = svg.attrs.margin

    // Histogram horizontal
    let data = randomXY(50, width, height, 5),
        data2 = [{ x: 1, y: 150 }, { x: 2, y: 250 }, { x: 3, y: 250 }, { x: 4, y: 350 }, { x: 5, y: 250 }, { x: 6, y: 250 }, { x: 7, y: 250 }, { x: 8, y: 250 }],
        ngroups = data2.length,

        needs_initial_g = d3.select('g#hbars').empty(),
        currentViz = svg.attr('viz')

    for (i in data) { data[i].y = d3.randomInt(1, ngroups + 1)() }

    d3.select('#text')
        .text('Now they are summarised horizontally')

    if (needs_initial_g) {
        barInitialiser()
    }

    if (currentViz == '2') {
        barShrinker(() => {
            circlePositioner(() => {
                barGrower()
            })
        })

    }

    function barInitialiser() {

        let xScale = d3.scaleLinear().domain([0, width]).range([0, width]),
            yScale = d3.scaleBand().domain(data2.map(d => d.x)).range([0, width]).padding(0.4)

        svg.append('g')
            .attr("id", 'hbars')
            .selectAll()
            .data(data2)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(0))
            .attr("width", d => xScale(0))
            .attr("y", (d) => yScale(d.x))
            .attr("height", yScale.bandwidth())
            .attr('transform', `translate(${margin}, ${margin})`)

        svg.append("g")
            .attr('id', 'hbars-xscale')
            .attr("transform", `translate(${margin},${height + 2 * margin})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
        //.attr("transform", "translate(-10,0)rotate(-45)")
        //.style("text-anchor", "end");

        svg.append("g")
            .attr('id', 'hbars-yscale')
            .attr("transform", `translate(-${2 * margin},${margin})`)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
    }

    function barShrinker(callback) {

        let yScale = d3.scaleLinear().domain([0, height]).range([height, 0])

        svg.select('#vbars')
            .selectAll("rect")
            .transition()
            .duration(500)
            .attr("y", () => yScale(0))
            .attr("height", () => height - yScale(0))
            .on('end', callback)

        svg.select('#vbars-xscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${height + 2 * margin})`)

        svg.select('#vbars-yscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(-${2 * margin},${margin})`)

    }

    function circlePositioner(callback) {

        let xScale = d3.scaleLinear().domain([0, width]).range([0, width]),
            yScale = d3.scaleBand().domain(data2.map(d => d.x)).range([0, width]).padding(0.4)
        yScaleBandwith = yScale.bandwidth()

        svg.selectAll("circle")
            .data(data)
            .transition()
            .duration(500)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y) + yScaleBandwith / 2)
            .attr("r", 5)
            .style('fill', 'blue')
            .transition()
            .duration(500)
            .attr("cx", d => xScale(-(yScaleBandwith / 2) - margin))
            .attr("r", yScaleBandwith / 2)
            .on('end', callback)
    }


    function barGrower() {

        let xScale = d3.scaleLinear().domain([0, width]).range([0, width]),
            yScale = d3.scaleBand().domain(data2.map(d => d.x)).range([0, width]).padding(0.4)

        svg.select('g#hbars')
            .selectAll("rect")
            .attr("x", (d) => xScale(0))
            .attr("width", d => xScale(0))
            .attr("y", (d) => yScale(d.x))
            .attr("height", yScale.bandwidth())
            .attr('fill', 'blue')
            .transition()
            .duration(500)
            .attr("width", d => width - xScale(d.y))

        svg.select('#hbars-xscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${height + margin})`)

        svg.select('#hbars-yscale')
            .transition()
            .duration(500)
            .attr("transform", `translate(${margin},${margin})`)

        svg.attr('viz', '3')
    }
}