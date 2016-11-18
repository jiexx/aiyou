//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
//bing map key AtW1XbPytl3BS995WVs0zo25_AX5Zu26Be59PPgYun3sHXPaEqvuhvRrq8EKCXQV
package search

import (
	"sync"
	//"errors"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"strconv"
)

type UDB struct {
	dbname string
	jdbc string
	db *sql.DB
}

var _dbs map[string]*UDB = nil
var _dbsonce sync.Once
func _getDBS() map[string]*UDB {
	if _dbs == nil {
		_dbsonce.Do(func() {
			_dbs = make(map[string]*UDB);
		})
	}
	return _dbs
}
func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}
func (this UDB) get(dbname string) *UDB  {
	dbs := _getDBS()
	d, ok := dbs[dbname]
	if !ok || d == nil {
		cfg := GetConfig()
		mysqldb, err := sql.Open("mysql", cfg.mysql_jdbc) //user:password@127.0.0.1/
		mysqldb.SetMaxIdleConns(100)
		if err != nil {
			stmt, err := mysqldb.Prepare("CREATE DATABASE "+dbname)
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err := res.RowsAffected()
			checkErr(err)
			
			//db.Close()
			if affect == 0 {
				return nil
			}
			dbs[dbname] = &UDB{jdbc:cfg.mysql_jdbc+dbname, db:mysqldb}
			return dbs[dbname]
		}
		return nil
	}
	return d
}
func (this *UDB) close(){
	if this.db != nil {
		this.db.Close()
	}
}

func (this UDB) rowsSave(tabname string, rows [][]string) bool{
	length := len(rows[0])
	for i, j := range rows {
		if length != len(j) {
			return false
		}
	}
	if this.db != nil {
		var col string
		rs, err := this.db.Query("SELECT 8 FROM  "+tabname)
		checkErr(err)

		for rs.Next() {
			err = rs.Scan(&col)
			checkErr(err)
		}
		if col != "8" {
			var crtcol  string = ""
			for k, v := range rows[0] {
				crtcol = crtcol + " col" + strconv.Itoa(k) + " text,"
			}
			crtcol = crtcol[:len(crtcol)-1]
			stmt, err := this.db.Prepare("CREATE TABLE "+tabname+" ("+crtcol+" );")
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err := res.RowsAffected()
			checkErr(err)

			if affect != 1 {
				return false
			}
		}
		var inscol  string = ""
		var valcol  string = ""
		for i, j := range rows {
			for k, v := range j {
				inscol = inscol + " col" + strconv.Itoa(k) + ","
				valcol = valcol + " '" + v + "',"
			}
			inscol = inscol[:len(inscol)-1]
			valcol = valcol[:len(valcol)-1]
			stmt, err := this.db.Prepare("INSERT INTO "+tabname+" ("+inscol+")VALUES("+valcol+");")
			checkErr(err)
		}

		res, err := stmt.Exec()
		checkErr(err)
		
		affect, err := res.RowsAffected()
		checkErr(err)
		
		if affect == len(records) {
			return true
		}
		//db.Close()
		return false
	}
	return false
}
func (this UDB) save(tabname string, cols []string) bool{ //cols 0 is id.
	if this.db != nil {
		var col string
		rows, err := this.db.Query("SELECT 8 FROM  "+tabname)
		checkErr(err)

		for rows.Next() {
			err = rows.Scan(&col)
			checkErr(err)
		}
		if col != "8" {
			var crtcol  string = ""
			for k, v := range cols {
				crtcol = crtcol + " col" + strconv.Itoa(k) + " text,"
			}
			crtcol = crtcol[:len(crtcol)-1]
			stmt, err := this.db.Prepare("CREATE TABLE "+tabname+" ("+crtcol+" );")
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err := res.RowsAffected()
			checkErr(err)

			if affect != 1 {
				return false
			}
		}
		var inscol  string = ""
		var valcol  string = ""
		for k, v := range cols {
			inscol = inscol + " col" + strconv.Itoa(k) + ","
			valcol = valcol + " '" + v + "',"
		}
		inscol = inscol[:len(inscol)-1]
		valcol = valcol[:len(valcol)-1]
		stmt, err := this.db.Prepare("INSERT INTO "+tabname+" ("+inscol+")VALUES("+valcol+");")
		checkErr(err)

		res, err := stmt.Exec()
		checkErr(err)
		
		affect, err := res.RowsAffected()
		checkErr(err)
		
		if affect == 1 {
			return true
		}
		//db.Close()
		return false
	}
	return false
}
func (this UDB) update(tabname string, cols []string) bool{  //cols 0 is id.
	if this.db != nil {
		var uptcol  string = ""
		var valcol  string = ""
		for i := 1; i < len(cols) ; i ++ {
			uptcol = uptcol + " col" + i + "='"+v+"',"
		}
		uptcol = uptcol[:len(uptcol)-1]
		stmt, err := this.db.Prepare("UPDATE "+tabname+" SET "+uptcol+" WHERE col0='"+cols[0]+"';") 
		checkErr(err)

		res, err := stmt.Exec()
		checkErr(err)
		
		affect, err := res.RowsAffected()
		checkErr(err)
		
		if affect == 1 {
			return true
		}
		//db.Close()
		return false
	}
	return false
}
func (this UDB) delete(tabname string, id string) bool{ //cols 0 is id.
	if this.db != nil {
		var uptcol  string = ""
		var valcol  string = ""
		for k, v := range cols {
			uptcol = uptcol + " col" + strconv.Itoa(k) + "='"+v+"',"
		}
		uptcol = uptcol[:len(uptcol)-1]
		stmt, err := this.db.Prepare("DELETE FROM "+tabname+" WHERE col0='"+id+"';")
		checkErr(err)

		res, err := stmt.Exec()
		checkErr(err)
		
		affect, err := res.RowsAffected()
		checkErr(err)
		
		if affect == 1 {
			return true
		}
		//db.Close()
		return false
	}
	return false
}
func (this *UDB) query(tabname string, qrycols []string, concols []string) [][]string { // 
	var results [][]string
	if this.db != nil {
		var concol  string = ""
		for i := 0; i < len(concols) ; i += 2 {
			concol = concol + " " + concols[i] + "='" + concols[i+1] + "' AND"
		}
		concol = concol[:len(concol)-3]
		var qrycol  string = ""
		for i := 0; i < len(qrycols) ; i ++ {
			qrycol = qrycol + " " + qrycols[i] + ","
		}
		qrycol = qrycol[:len(qrycol)-1]
		rows, err := this.db.Query("SELECT " + qrycol + " FROM  "+tabname+" WHERE "+concol+"';")
		checkErr(err)

		columns, err := rows.Columns()
		checkErr(err)
		
		rawResult := make([][]byte, len(columns))
		result := make([]string, len(columns))
		dest := make([]interface{}, len(columns))
		for i, _ := range rawResult {
			dest[i] = &rawResult[i]
		}
		
		for rows.Next() {
			//var col string
			//err = rows.Scan(&col)
			err = rows.Scan(dest...)
			checkErr(err)
			
			for i, raw := range rawResult {
				if raw == nil {
					result[i] = "\\N"
				} else {
					result[i] = string(raw)
				}
			}
			results = append(results, result)
		}
		//db.Close()
	}
	return results
}

