package main

import (
	"encoding/json"
    //"github.com/ant0ine/go-json-rest/rest"
    "log"
    "net/http"
	//"io"
	"sync"
	"time"
	"fmt"
	"golang.org/x/net/websocket"
	"strings"
	"reflect"
	//"bytes"

)

type Order struct {
	time string;
	order_id uint64;
	clazz string;
	price float64;
	amount int;
	status string;
}
func (g Order) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "time": g.time,  
        "order_id": g.order_id,  
        "clazz": g.clazz,  
		"price": g.price,  
		"amount": g.amount,  
		"status": g.status, 
    })  
}
type SellOrders struct {
	orders []Order;
	donelist []Order;
}
type BuyOrders struct {
	orders []Order;
	donelist []Order;
}

func (a *BuyOrders) handle(o Order) {
	if len(a.orders) == 0 {
		a.orders = append(a.orders, o);
		fmt.Println("BuyOrders", a, a.orders);
		return;
	}
	for i := 0 ; i < len(a.orders) ; i ++ {
		if o.price > a.orders[i].price {
			a.orders = append(a.orders[:i], append([]Order{o},a.orders[i:]...)...);
			//fmt.Println("BuyOrders", a.orders);
			return;
		}
	}
}
func (a *BuyOrders) get() *[]Order {
	//fmt.Println("Get BuyOrders", a.orders);
	return &a.orders;
}
func (a *BuyOrders) dones() *[]Order {
	//fmt.Println("Get BuyOrders", a.orders);
	return &a.donelist;
}

func (a *SellOrders) handle(o Order) {
	if len(a.orders) == 0 {
		a.orders = append(a.orders, o);
		fmt.Println("SellOrders", a);
		return;
	}
	for i := 0 ; i < len(a.orders) ; i ++ {
		if o.price <= a.orders[i].price {
			a.orders = append(a.orders[:i], append([]Order{o},a.orders[i:]...)...);
			//fmt.Println("SellOrders", a.orders);
			return;
		}
	}
}
func (a *SellOrders) get() *[]Order {
	//fmt.Println("Get SellOrders", a.orders);
	return &a.orders;
}
func (a *SellOrders) dones() *[]Order {
	//fmt.Println("Get SellOrders", a.orders);
	return &a.donelist;
}

type Handler interface {
	handle(o Order);
	get() *[]Order;
	dones() *[]Order;
}

type Actor struct {
	agent *Agent;
	h Handler;
	mux sync.Mutex;
	c_query chan Order;
	c_order chan Order;
}
var MAX_DEPTH = 100;
func (a *Actor)TradeOver() {
	ol := a.h.get();
	dl := a.h.dones();
	o := Order{time.Now().Format("2006-01-02 15:04:05"), (*ol)[0].order_id, (*ol)[0].clazz, (*ol)[0].price, (*ol)[0].amount, "whole"};
	(*dl) = append((*dl)[:0], append([]Order{o},(*dl)[0:]...)...);
	dll := len(*dl)
	if( dll >= MAX_DEPTH ) {
		(*dl) = append((*dl)[:dll-2], (*dl)[dll-1:]...);
	}
	(*ol) = append((*ol)[:0], (*ol)[1:]...);
	fmt.Println("TradeOver result", o);
	//a.c_query <- o;
}

func (a *Actor)TradePartial(amount int) {
	ol := a.h.get();
	dl := a.h.dones();
	o := Order{time.Now().Format("2006-01-02 15:04:05"), (*ol)[0].order_id, (*ol)[0].clazz, (*ol)[0].price, (*ol)[0].amount, "partial"};
	(*dl) = append((*dl)[:0], append([]Order{o},(*dl)[0:]...)...);
	dll := len(*dl)
	if( dll >= MAX_DEPTH ) {
		(*dl) = append((*dl)[:dll-2], (*dl)[dll-1:]...);
	}
	//a.dones = append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), (*ol)[0].order_id, (*ol)[0].clazz, (*ol)[0].price, amount, "partial"});
	(*ol)[0].amount = (*ol)[0].amount - amount;
	fmt.Println("TradePartial result", (*ol)[0]);
	//a.c_query <- (*ol)[0];
}



func (a *Actor)Receive(o chan Order, q chan Order, QUIT chan int) {
	//result := Order{};
	for {
		select {
		case order := <-o:
			a.mux.Lock();
			fmt.Println("Receive", order);
			a.h.handle(order);
			a.mux.Unlock();
			a.c_query <- order;
		/*case q <- result:
			fmt.Println("Actor result", result);
			if len(a.dones) > 0 {
				fmt.Println("result", result);
				result = a.dones[0];
			}*/
		case <-QUIT:
			fmt.Println("Quit!")
			return
		//default:
		//	fmt.Println("    .")
		//	time.Sleep(50 * time.Millisecond)
		}
	}
}

func (a *Actor)Cancel(id uint64) bool {
	result := false;
	ol := a.h.get();
	count := len(*ol);
	i := 0;
	a.mux.Lock();
	for ; i < count ; i ++ {
		if (*ol)[i].order_id == id {
			result = true;
			break;
		}
	}
	if result == true {
		(*ol) = append((*ol)[:i], (*ol)[i+1:]...);
	}
	a.mux.Unlock();
	return result;
}

func (a *Actor)Print() []Order {
	var result []Order;
	dl := a.h.dones();
	//a.mux.Lock();
	lenOrders := len(*dl);
	if lenOrders >= 10 {
		result = (*dl)[:10];
	}else {
		result = (*dl)[:lenOrders];
	}
	//a.mux.Unlock();
	//fmt.Println("Print", result);
	return result;
}

type Trade struct {
	time string `json:"time"`;
	buy_id uint64 `json:"buy_id"`;
	sell_id uint64 `json:"sell_id"`;
	price float64 `json:"price"`;
	amount int `json:"amount"`;
}
func (g Trade) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "time": g.price,  
        "buy_id": g.buy_id,  
        "sell_id": g.sell_id,  
		"price": g.price,  
		"amount": g.amount,  
    })  
} 
type Agent struct {
	dones *[]Trade;
	marketPrice *float64;
	seller *Actor;
	buyer *Actor;
	c_query chan Trade;
	c_quit chan int;
}

func (a *Agent)Trade() {
	bol := a.buyer.h.get();
	sol := a.seller.h.get();
	//fmt.Println("To Trade", len(*bol), len(*sol));
	if len(*bol) > 0 && len(*sol) > 0 {
		bo := (*bol)[0];
		so := (*sol)[0];
		//fmt.Println("Be Trade", bo, so);
		if  bo.price >= so.price {
			fmt.Println("Trading", bo, so);
			var amount =  bo.amount - so.amount;
			var t Trade;
			if amount < 0 {
				t = Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, bo.price, bo.amount};
				(*a.dones) = append((*a.dones), t);
				adl := len(*a.dones)
				if( adl >= MAX_DEPTH ) {
					(*a.dones) = append((*a.dones)[:0], (*a.dones)[1:]...);
				}
				a.buyer.TradeOver();
				a.seller.TradePartial(bo.amount);
			}else if amount > 0 {
				t = Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, so.price, so.amount};
				(*a.dones) = append((*a.dones), t);
				adl := len(*a.dones)
				if( adl >= MAX_DEPTH ) {
					(*a.dones) = append((*a.dones)[:0], (*a.dones)[1:]...);
				}
				a.buyer.TradePartial(so.amount);
				a.seller.TradeOver();
			}else {
				t = Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, so.price, so.amount};
				(*a.dones) = append((*a.dones), t);
				adl := len(*a.dones)
				if( adl >= MAX_DEPTH ) {
					(*a.dones) = append((*a.dones)[:0], (*a.dones)[1:]...);
				}
				a.buyer.TradeOver();
				a.seller.TradeOver();
			}
			fmt.Println("Trade result", t);
			*a.marketPrice = so.price;
			fmt.Println("Trade marketPrice", a.marketPrice, so.price, a);
			a.c_query <- t;
		}
	}
}

func (a *Agent)Deal(q chan Trade, QUIT chan int) {
	tick := time.Tick(200 * time.Millisecond);
	//result := Trade{};
	for {
		select {
		case <-tick:
			a.seller.mux.Lock();
			a.buyer.mux.Lock();
			a.Trade();			
			a.buyer.mux.Unlock();
			a.seller.mux.Unlock();
		/*case q <- result:
			fmt.Println("Agent result", result);
			if len(a.dones) > 0 {
				fmt.Println("result", result);
				result = a.dones[0];
			}*/
		case <-QUIT:
			fmt.Println("Quit!")
			return
		//default:
		//	fmt.Println("    .")
		//	time.Sleep(50 * time.Millisecond)
		}
	}
}
func makeAgent() Agent {
	a := Agent{dones:&[]Trade{}, marketPrice:new(float64), c_query:make(chan Trade), c_quit:make(chan int)};
	*a.marketPrice = 100.0;
	a.seller = &Actor{agent:&a, h:&SellOrders{}, c_query:make(chan Order), c_order:make(chan Order)};
	a.buyer = &Actor{agent:&a, h:&BuyOrders{}, c_query:make(chan Order), c_order:make(chan Order)};
	
	go a.Deal(a.c_query, a.c_quit);
	go a.seller.Receive(a.seller.c_order, a.seller.c_query, a.c_quit);
	go a.buyer.Receive(a.buyer.c_order, a.buyer.c_query, a.c_quit);
	
	return a;
}
var agent Agent;
var global_id uint64;
var conn []*websocket.Conn;
type Log struct {
	clazz string;
	price float64 `json:"marketPrice"`;
	trade Trade `json:"trade"`;
	order Order `json:"order"`;
}
func (g Log) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
		"clazz": g.clazz,  
        "price": g.price,  
        "trade": g.trade,  
        "order": g.order,  
    })  
} 
func echoHandler(ws *websocket.Conn) {
	defer func() {
		ws.Close()
	}();
	conn = append(conn, ws);
	for {
		select {
		case o := <- agent.c_query:
			fmt.Println("agent Send:", agent)
			for i, c := range conn {
				log := Log{price:*agent.marketPrice, trade:o, clazz:"trade log"};
				fmt.Println("agent Send", log);
				err := websocket.JSON.Send(c, log);
				//b, err := json.Marshal(log)
				//fmt.Println("agent Send  ----", string(b[:]));
				//err = websocket.Message.Send(c, string(b[:]));
				if err != nil {
					fmt.Println("agent Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case s := <- agent.seller.c_query:
			fmt.Println("seller Send:", s);
			for i, c := range conn {
				log := Log{clazz:"sell log", order:s};
				fmt.Println("seller Send", log);
				err := websocket.JSON.Send(c, log);
				if err != nil {
					fmt.Println("seller Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case b := <- agent.buyer.c_query:
			fmt.Println("buyer Send:", b);
			for i, c := range conn {
				log := Log{clazz:"buy log", order:b};
				fmt.Println("buyer Send", log);
				err := websocket.JSON.Send(c, log);
				if err != nil {
					fmt.Println("buyer Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case <-agent.c_quit:
			fmt.Println("Quit!");
			return;
		}
	}
}
var mux = http.NewServeMux();
func main() {
	agent = makeAgent();
	global_id = 0;
	go func() {
		http.Handle("/echo", websocket.Handler(echoHandler))
		fmt.Println("SockServer/echo at 8082");
		log.Fatal(http.ListenAndServe(":8082", nil));
	}()
    mux := http.NewServeMux()
 	mux.HandleFunc("/order", MakeOrder)
	mux.HandleFunc("/depth", DepthOrder)
	mux.HandleFunc("/cancel", CancelOrder)
	mux.Handle("/", http.FileServer(http.Dir("./test")))

	fmt.Println("WebServer at 8081");
	http.HandleFunc("/", HomeHandler) 
	//http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./test"))))
	//http.Handle("/", http.FileServer(http.Dir("test")));
 	http.ListenAndServe(":8081", mux)
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {  
    mux.ServeHTTP(w, r);
}  
type OrderRequest struct{
	Symbol string `json:"symbol"`;
	Clazz string `json:"clazz"`;
	Price float64 `json:"price"`;
	Amount int `json:"amount"`;
}
type OrderResponse struct{
	Result bool `json:"result"`;
	Order_id string `json:"order_id"`;
	Clazz string `json:"clazz"`;
	Price float64;
	Amount int;
}

func MakeOrder(w http.ResponseWriter, r *http.Request) {
	result := false;
	var order_req OrderRequest;
	if r.Method == "GET" {
		jsonDataFromHttp := reflect.ValueOf(r.URL.Query()).MapKeys();
		str := fmt.Sprint(jsonDataFromHttp[0]);
		err := json.Unmarshal([]byte(str), &order_req)
		if err == nil && order_req.Amount > 0 {
			pri := order_req.Price;
			fmt.Println("MakeOrder", order_req, pri);
			
			if strings.Contains(order_req.Clazz, "market") {
				pri = *agent.marketPrice;
			}
			if strings.Contains(order_req.Clazz, "buy") {
				//if pri <= *agent.marketPrice * 2.2 {
					o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), order_id:global_id, clazz:order_req.Clazz, price:pri, amount:order_req.Amount, status:""};
					fmt.Println("MakeOrder buy o", o);
					agent.buyer.c_order <- o;
					result = true;
				//}
			}else if strings.Contains(order_req.Clazz, "sell") {
				//if pri >= *agent.marketPrice * 0.1 {
					o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), order_id:global_id, clazz:order_req.Clazz, price:pri, amount:order_req.Amount, status:""};
					fmt.Println("MakeOrder sell o", o);
					agent.seller.c_order <- o;
					result = true;
				//}
			}
			global_id ++;
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*");
	if result == true {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:fmt.Sprint(global_id), Clazz:order_req.Clazz, Price:order_req.Price, Amount:order_req.Amount});	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:"0", Clazz:order_req.Clazz, Price:order_req.Price, Amount:order_req.Amount});
		w.Write([]byte(js));
	}
	
}
type CancleRequest struct{
	Symbol string;
	Clazz string;
	Order_id uint64;
}
func CancelOrder(w http.ResponseWriter, r *http.Request) {
    //code := r.PathParam("code")
	result := false;
	var order_req CancleRequest;
	if r.Method == "GET" {
		jsonDataFromHttp := reflect.ValueOf(r.URL.Query()).MapKeys();
		str := fmt.Sprint(jsonDataFromHttp[0]);
		err := json.Unmarshal([]byte(str), &order_req)
		if err == nil {
			if strings.Contains(order_req.Clazz, "buy") {
				result = agent.buyer.Cancel(order_req.Order_id);
			}else if strings.Contains(order_req.Clazz, "sell") {
				result = agent.seller.Cancel(order_req.Order_id);
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if result == true {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:fmt.Sprint(global_id), Clazz:order_req.Clazz, Price:0, Amount:0});	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:"0", Clazz:order_req.Clazz, Price:0, Amount:0});
		w.Write([]byte(js));
	}
}

func DepthOrder(w http.ResponseWriter, r *http.Request) {
    result := false;
	var d []Order;
	if r.Method == "GET" {
		d = append(d, agent.buyer.Print()...);
		//fmt.Println("Print buyer", d);
		d = append(d, agent.seller.Print()...);
		//fmt.Println("Print seller", d);
		result = true;
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if result == true {
		js, _ := json.Marshal(d);
		w.Write([]byte(js));
	}else {
		w.Write([]byte(""));
	}
}
