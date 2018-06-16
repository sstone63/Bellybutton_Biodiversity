
# coding: utf-8

# In[ ]:


#import dependencies
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import (Flask, render_template, redirect, request, jsonify)

#create database
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite")

Base = automap_base()

Base.prepare(engine, reflect=True)

otu_db = Base.classes.otu
samples_db = Base.classes.samples
samples_meta_db = Base.classes.samples_metadata

session = Session(engine)

app = Flask(__name__)

#create home route
@app.route("/")
def home(): 
    return render_template("index.html")

#create names route
@app.route("/names")
def sample_names():
    results = samples_db.__table__.columns.keys()
    return jsonify(results)

#create otu route
@app.route("/otu")
def otu_descriptions():
    results = session.query(otu_db.lowest_taxonomic_unit_found).all()
    results = [str(result[0]) for result in results]
    return jsonify(results)

#create metadata route
@app.route("/metadata/<sample>")
def get_meta_sample(sample):
    query = [samples_meta_db.AGE,
        samples_meta_db.BBTYPE,
        samples_meta_db.ETHNICITY,
        samples_meta_db.GENDER,
        samples_meta_db.LOCATION,
        samples_meta_db.SAMPLEID]
    sample_id = sample[3:]
    results = session.query(*query).filter(samples_meta_db.SAMPLEID == sample_id).all()[0]
    results_dict = {}
    for i in results:
        results_dict["AGE"] = i[0]
        results_dict["BBTYPE"] = i[1]
        results_dict["ETHNICITY"] = i[2]
        results_dict["GENDER"] = i[3]
        results_dict["LOCATION"] = i[4]
        results_dict["SAMPLEID"] = i[5]
        
    return jsonify(results_dict)

@app.route("/wfreq/<sample>")
def wfreq_result(sample):
    sample_id = sample[3:]
    results = session.query(samples_meta_db.WFREQ).filter(samples_meta_db.SAMPLEID == sample_id).all()
    
    try:
        return jsonify(results[0][0])
    except:
        return "not found"
    
@app.route("/samples/<sample>")
def get_samples(sample):
    otu_ids = []
    sample_ids = []
    results = session.query(samples_db.otu_id, getattr(samples_db, sample)).order_by(getattr(samples_db, sample).desc())
    for otu, sample in results:
        otu_ids.append(otu)
        sample_ids.append(sample)
    results_dict = {"otu_ids": otu_ids, "sample_values": sample_ids}
    
    return jsonify(results_dict)

if __name__ == "__main__": 
    app.run(debug=False)

