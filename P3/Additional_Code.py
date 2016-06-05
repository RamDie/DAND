# Auditing and cleaning datase
# ============================


from pymongo import MongoClient
import xml.etree.cElementTree as ET
import re

#Regular Expressions
phonerg = re.compile(r'.*(phone).*')
numrg = re.compile(r'\d')
housenumrg = re.compile(r'^[\d]+$') #only numbers
hn_multiple = re.compile(r'^[\d,;\-]+$') #multiple house numbers
float_num = re.compile(r'^[\d\.]+$')

#Functions
def clean_phone(phone):
    phone_num = ''
    
    for char in phone:
        if numrg.match(char):
            phone_num = phone_num + char

        if phone_num.startswith('54'):
            phone_num = phone_num[2:]
        elif phone_num.startswith('054'):
            phone_num = phone_num[3:] 
        elif phone_num.startswith('0054'):
            phone_num = phone_num[4:]   

        if phone_num.startswith('11'):
            phone_num = phone_num[2:]
        elif phone_num.startswith('011'):
            phone_num = phone_num[3:]   
            
    return phone_num

#Document to upload into mongodb
doc = dict()

#Data is cleaned and prepared to upload into mongodb (Data Wrangling)
def process_map(filename):
    data = []   
    phone_num = ''
    add_flg = ''
    flg_amenity = ''
    
    for event, element in ET.iterparse(filename, events=("start",)):
        doc = {}
        doc['phone']= list()
        doc['housenumber'] = list()
        flg_amenity = ''
                
        if element.tag == "node":
            doc['type'] =  "node"
        else:
            continue        
        
        for subel in element:
            if subel.tag == 'tag':
                
                #Phones
                if phonerg.search(subel.attrib['k']):  
                    phones = re.compile("[/;,]").split(subel.attrib['v'])
                    
                    if len(phones) > 0:
                        add_flg = 'x'
                        
                    for phone in phones:
                        phone_num = clean_phone(phone)                                                
                        
                        # If it is not a cellphone, the phone code is saved 
                        if phone_num.startswith('4'):                            
                            doc['phonecode'] = phone_num[1:4]
                            
                        doc['phone'].append(phone_num)                          
                
                #Housenumber
                elif ( subel.attrib['k'] == 'addr:housenumber' ):
                        
                    # Only numbers
                    if housenumrg.match(subel.attrib['v']):
                        add_flg = 'x'
                        doc['housenumber'].append(subel.attrib['v'])
                        
                    # Only numbers and periods (possibly a decimal value)
                    elif float_num.match(subel.attrib['v']):
                        try:
                            doc['housenumber'].append(str(int(float(subel.attrib['v']))))
                        except ValueError: 
                            False
                            
                    # Multiple housenumbers
                    elif hn_multiple.match(subel.attrib['v']):
                        add_flg = 'x'
                        doc['housenumber'] = re.compile(r'[,;\-]').split(subel.attrib['v'])
                
                #Street
                elif ( subel.attrib['k'] == 'addr:street' ):
                    add_flg = 'x'
                    doc['street'] = subel.attrib['v']
                    
                #PostCode
                elif ( subel.attrib['k'] == 'addr:postcode'):
                    add_flg = 'x'
                    postcode = ''
                    for char in subel.attrib['v']:                        
                        if numrg.match(char):
                            postcode = postcode + char
                    doc['postcode'] = postcode
                
                #Amenities
                elif (flg_amenity == 'x') and (subel.attrib['k'] == 'name'):
                    doc['amenity']['name'] = subel.attrib['v'] 
                    flg_amenity = ''
                elif ( subel.attrib['k'] == 'amenity' ):
                    if subel.attrib['v'] in ['bank','restaurant','fast_food']:
                        doc['amenity'] = {}
                        doc['amenity']['type']=subel.attrib['v']
                        flg_amenity = 'x'
                        
        # If data was found, the document is appended         
        if add_flg == 'x':                  
            data.append(doc) 
            add_flg = ''
        
    return data

# Data is uploaded into mongodb    
def upload_into_mongodb():   
    data = process_map('C:\Users\Usuario\Desktop\Data Science\DAND\P3 - Wrangle OpenStreetMap Data\Project\caba&surrounds.osm')

    #Connection to MongoDB
    client = MongoClient('mongodb://localhost:27017')
    db = client.maps

    #Documentos are inserted into MongoDB
    for nodo in data:
        db.nodos.insert(nodo)

# Main        
upload_into_mongodb()

