//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
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
	userid string
	jdbc string
	db *DB
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
func (this UDB) get(uid string) *UDB  {
	dbs := _getDBS()
	d, ok := dbs[uid]
	if !ok || d == nil {
		cfg := GetConfig()
		mysqldb, err := sql.Open("mysql", cfg.mysql_jdbc) //user:password@127.0.0.1/
		mysqldb.SetMaxIdleConns(100)
		if err != nil {
			stmt, err := mysqldb.Prepare("CREATE DATABASE "+uid)
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err := res.RowsAffected()
			checkErr(err)
			
			//db.Close()
			if affect == 0 {
				return nil
			}
			dbs[uid] = &UDB{userid:uid, jdbc:cfg.mysql_jdbc + uid, db:mysqldb}
			return dbs[uid]
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

func (this UDB) saves(tableid string, records [][]string) bool{
	if this.db != nil {
		var col string
		rows, err := this.db.Query("SELECT 8 FROM  "+tableid)
		checkErr(err)

		for rows.Next() {
			err = rows.Scan(&col)
			checkErr(err)
		}
		if col != "8" {
			var crtcol  string = ""
			for k, v := range records[0] {
				crtcol = crtcol + " col" + strconv.Itoa(k) + " text,"
			}
			crtcol = crtcol[:len(crtcol)-1]
			stmt, err := mysqldb.Prepare("CREATE TABLE "+tableid+" ("+crtcol+" );")
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
		for i, j := range records {
			for k, v := range j {
				inscol = inscol + " col" + strconv.Itoa(k) + ","
				valcol = valcol + " '" + v + "',"
			}
			inscol = inscol[:len(inscol)-1]
			valcol = valcol[:len(valcol)-1]
			stmt, err := mysqldb.Prepare("INSERT INTO "+tableid+" ("+inscol+")VALUES("+valcol+");")
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
func (this UDB) save(tableid string, cols []string) bool{
	if this.db != nil {
		var col string
		rows, err := this.db.Query("SELECT 8 FROM  "+tableid)
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
			stmt, err := mysqldb.Prepare("CREATE TABLE "+tableid+" ("+crtcol+" );")
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
		stmt, err := mysqldb.Prepare("INSERT INTO "+tableid+" ("+inscol+")VALUES("+valcol+");")
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
func (this UDB) update(tableid string, id string, cols []string) bool{
	if this.db != nil {
		var uptcol  string = ""
		var valcol  string = ""
		for k, v := range cols {
			uptcol = uptcol + " col" + strconv.Itoa(k) + "='"+v+"',"
		}
		uptcol = uptcol[:len(uptcol)-1]
		stmt, err := mysqldb.Prepare("UPDATE "+tableid+" SET "+uptcol+" WHERE col0='"+id+"';")
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
func (this UDB) delete(tableid string, id string) bool{
	if this.db != nil {
		var uptcol  string = ""
		var valcol  string = ""
		for k, v := range cols {
			uptcol = uptcol + " col" + strconv.Itoa(k) + "='"+v+"',"
		}
		uptcol = uptcol[:len(uptcol)-1]
		stmt, err := mysqldb.Prepare("DELETE FROM "+tableid+" WHERE col0='"+id+"';")
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
func (this *UDB) query(tabname string, colname string) []string {
	var cols []string
	if this.db != nil {
		rows, err := this.db.Query("SELECT " + colname + " FROM  "+tabname)
		checkErr(err)

		for rows.Next() {
			var col string
			err = rows.Scan(&col)
			checkErr(err)
			
			cols = append(cols, col)
		}
		//db.Close()
	}
	return cols
}

