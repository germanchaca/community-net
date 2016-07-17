import pandas as pd
import numpy as np
import networkx as nx
from networkx.readwrite import json_graph
from sklearn.cluster import KMeans

# data importing
#raw_data =pd.read_csv('../data/trade_data.csv', sep=',', error_bad_lines=False, index_col=False, dtype='unicode')
raw_data = pd.read_csv('data/trade_data.csv').dropna(subset = ['Flow____0'])

def spectral_clustering(graph, dim_spec = 5, n_cluster = 13):
    """
    return the prediction of kmeans model of the spectral clustering
    """

    cluster_km = KMeans(n_clusters = n_cluster,max_iter = 10000,tol = 0.00001)
    features_spectre = nx.spectral_layout(graph,dim = dim_spec)
    cluster_km.fit(features_spectre.values())
    pred = cluster_km.predict(features_spectre.values())

    dict_predict = {}
    for i in range(len(graph.nodes())):
        dict_predict.update(
        {
                graph.nodes()[i] : int(pred[i])
            })
        
    return dict_predict

def set_method(method,year):
	#GTC_object = Graph_GT(year = year, raw_data = raw_data)
	#networkx graph object
	df = raw_data.loc[raw_data['Yr']==year]
	list_trade = df.iloc[:,[2,5,7,3,4,6,9]].values
	links=[]
	G = nx.Graph()
	nodes = []

	for row in list_trade:
		#print type(row[2])
		if (row[0]!="World") * (row[1]!="World")==1:
			links.append({
				"source":row[0],
				"target":row[1],
				"flow":row[2]
				})
			# nodes.append(row[0])
			# nodes.append(row[1])
			nodes.append({
				"id":row[0],
				"type":row[3],
				"continent":row[4]
			})
			nodes.append({
				"id":row[1],
				"type":row[5],
				"continent":row[6]
				})
			###### construction of nx.graph
			G.add_edge(row[0],row[1])
			

	nodes_list=[node["id"] for node in nodes]
	nodes_list=list(set(nodes_list))
	G.add_nodes_from(nodes_list)
	nodes=[dict(t) for t in set([tuple(d.items()) for d in nodes])]
################################ spectral clustering ##################
	dict_predict = spectral_clustering(graph = G)

	for node in nodes:
		node["community"]=dict_predict[node["id"]	]
#######################################################################

#######################################################################
	return {'links':links,'nodes':nodes,'clustering':dict_predict}
