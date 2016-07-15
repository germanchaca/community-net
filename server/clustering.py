import pandas as pd
import numpy as np
import networkx as nx
from networkx.readwrite import json_graph
from sklearn.cluster import KMeans

# data importing
#raw_data =pd.read_csv('../data/trade_data.csv', sep=',', error_bad_lines=False, index_col=False, dtype='unicode')
raw_data = pd.read_csv('data/trade_data.csv').dropna(subset = ['Flow____0'])

def spectral_clustering(graph, dim_spec = 3, n_cluster = 10):
    """
    return the prediction of kmeans model of the spectral clustering
    """

    cluster_km = KMeans(n_clusters = n_cluster,max_iter = 10000,tol = 0.00000001)
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
	list_trade = df.iloc[:,[2,5,7]].values
	data=[]
	G = nx.Graph()
	nodes = []

	for row in list_trade:
		#print type(row[2])
		# if type(row[2]) == float:
		data.append({
			"source":row[0],
			"target":row[1],
			"flow":row[2]
			})
		###### construction of nx.graph

		G.add_edge(row[0],row[1],weight = row[2])
        nodes.append(row[0])
        nodes.append(row[1])
        nodes = set(nodes)
        G.add_nodes_from(nodes)
################################ spectral clustering ##################
	dict_predict = spectral_clustering(graph = G)
#######################################################################

#######################################################################
	return {'graph_data':data, 'clustering_spec':dict_predict}
