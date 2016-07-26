import pandas as pd
import numpy as np
import networkx as nx
from sklearn.cluster import KMeans
import community_louvain

# data importing
#raw_data =pd.read_csv('../data/trade_data.csv', sep=',', error_bad_lines=False, index_col=False, dtype='unicode')
raw_data = pd.read_csv('data/clean_data.csv').dropna(subset = ['Flow'])
class Graph_GT:
    def __init__(self, year, raw_data = raw_data):
        """
        Initialization
        self.df is a pd.dataframe for the given year
        """

        self.year = year
        self.df = raw_data.loc[raw_data['Yr']==year]
 

    def country_list(self):
        """
        raw_date should be a pd.dataframe
        
        """
        country_list = set(list(self.df.Reporting_Entity_RIC_Name)\
                           +list(self.df.Partner_Entity_RIC_Name))
        country_list = sorted(list(country_list))
        return country_list
    
    
    def graph(self):
        """
        creat a nx.graph object(weighted & directed)
        of the trading data for the given year
        """
        
        list_trade = self.df.values
        list_trade_nanremoved = []
        for row in list_trade:
            if np.isnan(row[3]) == False:
                list_trade_nanremoved +=  [row]
        list_trade = np.array(list_trade_nanremoved)

        #min_max_scaler = preprocessing.MinMaxScaler()
        #
        #list_trade[:,2] = min_max_scaler.fit_transform(list_trade[:,2])       
        #list_trade[:,2] = preprocessing.scale(list_trade[:,2])

        G = nx.Graph()
        nodes = []
        for row in list_trade:
            #if (row[3]=="Country")*(row[6]=="Country")==1:
            #if np.isnan(row[2])==False:
            #G.add_edge(row[0],row[1],weight = np.exp(-0.5*row[2]**2))
                #G.add_edge(row[0],row[1],weight = row[2])
                G.add_edge(row[1],row[2])
                nodes.append(row[1])
                nodes.append(row[2])
        nodes = set(nodes)
        G.add_nodes_from(nodes)
        return G
    
    def node_link_data(self):
        """
        creat a nx.graph object(weighted & directed)
        of the trading data for the given year
        """
        
        list_trade = self.df.values
#         list_trade_nanremoved = []
#         for row in list_trade:
#             if np.isnan(row[3]) == False:
#                 list_trade_nanremoved +=  [row]
#         list_trade = np.array(list_trade_nanremoved)

        #min_max_scaler = preprocessing.MinMaxScaler()
        #
        #list_trade[:,2] = min_max_scaler.fit_transform(list_trade[:,2])       
        #list_trade[:,2] = preprocessing.scale(list_trade[:,2])
        data = {"nodes": [], "edges": []}
        for row in list_trade:
#             if (row[3]=="Country")*(row[6]=="Country")==1:
            data["edges"].append({
                "source":row[1],
                "target":row[2],
                "flow":row[3]
                })
            # nodes.append(row[0])
            # nodes.append(row[1])
            data["nodes"].append({
                "id":row[1],
                "label":row[1],
                "continent":row[4],
                "type":row[5]
            })
            data["nodes"].append({
                "id":row[2],
                "label":row[2],
                "continent":row[6],
                "type":row[7]
                })
        data["nodes"]=[dict(t) for t in set([tuple(d.items()) for d in data["nodes"]])]
        return data

def spectral_clustering(graph, n_cluster):
    """
    return the prediction of kmeans model of the spectral clustering
    """
    Lap_nom = nx.normalized_laplacian_matrix(graph).todense()
    eig_val, eig_vec = np.linalg.eig(Lap_nom)
    k = 10
    selected_vec = np.zeros([len(eig_val),k])
    thr = sorted(eig_val)[k-1]
    eig_val, eig_vec = np.linalg.eig(Lap_nom)
    ind = 0

    for i in range(len(eig_val)):
    	if eig_val[i]<=thr:
    		selected_vec[:,ind] = np.array(eig_vec)[:,i]
    		ind += 1
	
	# X = selected_vec
	cluster_km = KMeans(n_clusters = n_cluster,max_iter = 10000,tol = 0.00001)
	
	features_spectre = selected_vec
	cluster_km.fit(features_spectre)
	pred = cluster_km.predict(selected_vec)

	dict_predict = {}
	for i in range(len(graph.nodes())):
	    dict_predict.update(
	    {	graph.nodes()[i] : int(pred[i])
	        })
	        
    return dict_predict

def louvain_partition(graph):
	partition = community_louvain.best_partition(graph)
	return partition

def set_method(method,year,cluster):
	GT = Graph_GT(year = year)
	graph=GT.graph()
	json_graph=GT.node_link_data()

	# df = raw_data.loc[raw_data['Yr']==year]
	# list_trade = df.values
	# links=[]
	# G = nx.Graph()
	# nodes = []

	# for row in list_trade:
	# 	#print type(row[2])
	# 	# if (row[0]!="World") * (row[1]!="World") * (row[4]!="Geographical Area")*(row[6]!="Geographical Area")==1:
	# 	if (row[5]=="Country")*(row[7]=="Country")==1:
	# 		links.append({
	# 			"source":row[1],
	# 			"target":row[2],
	# 			"flow":row[3]
	# 			})
	# 		# nodes.append(row[0])
	# 		# nodes.append(row[1])
	# 		nodes.append({
	# 			"id":row[1],
	# 			"continent":row[4],
	# 			"type":row[5]
	# 		})
	# 		nodes.append({
	# 			"id":row[2],
	# 			"continent":row[6],
	# 			"type":row[7]
	# 			})
	# 		###### construction of nx.graph
	# 		G.add_edge(row[1],row[2])
			
	# nodes_list=[node["id"] for node in nodes]
	# nodes_list=list(set(nodes_list))
	# G.add_nodes_from(nodes_list)
	# nodes=[dict(t) for t in set([tuple(d.items()) for d in nodes])]
################################ spectral clustering ##################
	if method=="spectral":
		dict_predict = spectral_clustering(graph = graph,n_cluster=cluster)

############################# spectral clustering #####################
	elif method=="louvain":
		dict_predict = louvain_partition(graph=graph)
#######################################################################
	# pos = nx.fruchterman_reingold_layout(graph)

	for node in json_graph["nodes"]:
	    node["community"]=dict_predict[node["id"]]
	    # node["x"]= pos[node["id"]][0]
	    # node["y"]= pos[node["id"]][1]
	    # node["size"]= 1

	for i in range(len(json_graph["edges"])):
		json_graph["edges"][i]["id"]="e"+str(i)

	return json_graph
