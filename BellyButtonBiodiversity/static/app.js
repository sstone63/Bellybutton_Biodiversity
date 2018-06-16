// initiate the dropdown button
Plotly.d3.json('/names', function(error, names){
    if (error) throw error;
    for (var i = 0; i < names.length; i++){
        d3.select("#dataselect").append("option").attr("value",`${names[i]}`).text(`${names[i]}`)
    }
});

// Create initial Values Table
Plotly.d3.json("/metadata/BB_940", function(error, metadata) {
    if (error) throw error;
    d3.select("#table").append('li').text(`AGE: ${metadata.AGE}`)
    d3.select("#table").append('li').text(`BBTYPE: ${metadata.BBTYPE}`)
    d3.select("#table").append('li').text(`ETHNICITY: ${metadata.ETHNICITY}`)
    d3.select("#table").append('li').text(`LOCATION: ${metadata.LOCATION}`)
    d3.select("#table").append('li').text(`SAMPLEID: ${metadata.SAMPLEID}`)
});

// Function upon opject selection change
function intialize_page(select) {
    console.log(select);
    d3.selectAll("li").remove();
    // Create new table
    Plotly.d3.json(`/metadata/${select}`, function(error, response){
        if (error) throw error;
        d3.select("#table").append('li').text(`AGE: ${response.AGE}`)
        d3.select("#table").append('li').text(`BBTYPE: ${response.BBTYPE}`)
        d3.select("#table").append('li').text(`ETHNICITY: ${response.ETHNICITY}`)
        d3.select("#table").append('li').text(`LOCATION: ${response.LOCATION}`)
        d3.select("#table").append('li').text(`SAMPLEID: ${response.SAMPLEID}`)
    })

    //create new plot
    Plotly.d3.json(`/samples/${select}`, function(error, response){
        if (error) throw error;
        var otu_val = [];
        var otu_id = [];
        var otu_desc = [];
                
        for(var i = 0; i<10; i++){
            otu_val.push(response.sample_values[i]);
            otu_id.push(response.otu_ids[i]);
        }
        Plotly.d3.json(`/otu`, function(error, desc){
            if (error) throw error;
            for(var j = 0; j<otu_id.length; j++){
                otu_desc.push(desc[j]);
            }
                   
            var trace1 = [{
                values:otu_val,
                labels:otu_id,
                text:otu_desc,
                hoverinfo:otu_desc,
                type: 'pie'
            }];
            
            var layout = {
                title: `OTU Values Frequency for sample ${select}`,
                height: 400,
                width: 1000
            };
            Plotly.plot('pieplot', trace1, layout);

            var trace2 = [{
                y:response.otu_ids,
                x:response.sample_values,
                mode: 'markers',
                marker:{
                    color:otu_id,
                    size:otu_val
                }
            }];

            layout={
                title:`OTU Values for each OTU ID for sample ${select}`,
                height: 800,
                width: 1400,
                xaxis:{
                    title:"OTU ID"
                },
                yaxis:{
                    title:"Values"
                }
            }
            Plotly.plot('bubbleplot', trace2, layout);
        })
    })
};