import pandas as pd
import numpy as np
import networkx as nx
from networkx.readwrite import json_graph
from sklearn.cluster import KMeans

# data importing
#raw_data =pd.read_csv('../data/trade_data.csv', sep=',', error_bad_lines=False, index_col=False, dtype='unicode')
raw_data = pd.read_csv('data/clean_data.csv').dropna(subset = ['Flow'])

def spectral_clustering(graph, dim_spec, n_cluster):
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

def set_method(method,year,cluster):
	#GTC_object = Graph_GT(year = year, raw_data = raw_data)
	#networkx graph object
	# year=int(year)
	# cluster=int(cluster)
	df = raw_data.loc[raw_data['Yr']==year]
	list_trade = df.values
	links=[]
	G = nx.Graph()
	nodes = []

	for row in list_trade:
		#print type(row[2])
		# if (row[0]!="World") * (row[1]!="World") * (row[4]!="Geographical Area")*(row[6]!="Geographical Area")==1:
		if (row[5]=="Country")*(row[7]=="Country")==1:
			links.append({
				"source":row[1],
				"target":row[2],
				"flow":row[3]
				})
			# nodes.append(row[0])
			# nodes.append(row[1])
			nodes.append({
				"id":row[1],
				"continent":row[4],
				"type":row[5]
			})
			nodes.append({
				"id":row[2],
				"continent":row[6],
				"type":row[7]
				})
			###### construction of nx.graph
			G.add_edge(row[1],row[2])
			
	nodes_list=[node["id"] for node in nodes]
	nodes_list=list(set(nodes_list))
	G.add_nodes_from(nodes_list)
	nodes=[dict(t) for t in set([tuple(d.items()) for d in nodes])]
################################ spectral clustering ##################
	dict_predict = spectral_clustering(graph = G,dim_spec = 1,n_cluster=cluster)

	for node in nodes:
		node["community"]=dict_predict[node["id"]]
#######################################################################

#######################################################################
	return {'links':links,'nodes':nodes,'clustering':dict_predict}
