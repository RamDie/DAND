import csv
path1 = 'C:\Users\Usuario\Desktop\Data Science\DAND\P6 - Make Effective Data Visualization\BarChar\Multiple\data\prosperLoanData.csv'
path2 = 'C:\Users\Usuario\Desktop\Data Science\DAND\P6 - Make Effective Data Visualization\BarChar\Multiple\data\prosperLoanDataNew.csv'

with open(path1, 'rb') as inp_file, open(path2, 'wb') as out_file:
    writer = csv.writer(out_file)
    for idx,row in enumerate(csv.reader(inp_file)):
        if ((idx == 0) or (row[18] in ['Homemaker','Bus Driver','Sales - Commission','Scientist','Computer Programmer'])):
            writer.writerow(row)