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
type SellOrders []Order;
type BuyOrders []Order;

func (a BuyOrders) handle(o Order) {
	for i := 0 ; i < len(a) ; i ++ {
		if o.price > a[i].price {
			a = append(a[:i], append([]Order{o},a[i:]...)...);
			return;
		}
	}
}

func (a SellOrders) handle(o Order) {
	for i := 0 ; i < len(a) ; i ++ {
		if o.price <= a[i].price {
			a = append(a[:i], append([]Order{o},a[i:]...)...);
			return;
		}
	}
}

type Handler interface {
	handle(o Order);
}

type Actor struct {
	agent *Agent;
	orders []Order;
	dones []Order;
	h Handler;
	mux sync.Mutex;
	c_query chan Order;
	c_order chan Order;
}

func (a *Actor)TradeOver() {
	a.dones = append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].clazz, a.orders[0].price, a.orders[0].amount, "whole"});
	a.orders = append(a.orders[:0], a.orders[1:]...);
}

func (a *Actor)TradePartial(amount int) {
	a.dones = append(a.dones, Order{time.Now().Format("2006-01-02 15:04:05"), a.orders[0].order_id, a.orders[0].clazz, a.orders[0].price, amount, "partial"});
	a.orders[0].amount = amount;
}



func (a *Actor)Receive(o chan Order, q chan Order, QUIT chan int) {
	result := Order{};
	for {
		select {
		case order := <-o:
			a.mux.Lock();
			fmt.Println("Receive", order);
			a.h.handle(order);
			a.mux.Unlock();
		case q <- result:
			fmt.Println("Actor result", result);
			if len(a.dones) > 0 {
				fmt.Println("result", result);
				result = a.dones[0];
			}
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
	ol := &a.orders;
	i := 0;
	a.mux.Lock();
	for ; i < len(*ol) ; i ++ {
		if (*ol)[i].order_id == id {
			result = true;
			break;
		}
	}
	if result == true {
		*ol = append((*ol)[:i], (*ol)[i+1:]...);
	}
	a.mux.Unlock();
	return result;
}

func (a *Actor)Print() []Order {
	var result []Order;
	lenOrders := len(a.orders);
	a.mux.Lock();
	if lenOrders >= 20 {
		for i := 0 ; i < 20 ; i ++ {
			result[i] = a.orders[i];
		}
	}else {
		for i := 0 ; i < lenOrders ; i ++ {
			result[i] = a.orders[i];
		}
		for i := lenOrders ; i < 20 ; i ++ {
			result[i] = Order{};
		}
	}
	a.mux.Unlock();
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
	dones []Trade;
	marketPrice float64;
	seller *Actor;
	buyer *Actor;
	c_query chan Trade;
	c_quit chan int;
}

func (a *Agent)Trade() {
	if len(a.buyer.orders) > 0 && len(a.buyer.orders) > 0 {
		bo := a.buyer.orders[0];
		so := a.seller.orders[0];
		if  bo.price >= so.price {
			fmt.Println("Trading", bo, so);
			var amount =  bo.amount - so.amount;
			if amount < 0 {
				a.dones = append(a.dones, Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, bo.price, bo.amount});
				a.buyer.TradeOver();
				a.seller.TradePartial(a.buyer.orders[0].amount);
			}else if amount > 0 {
				a.dones = append(a.dones, Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, so.price, so.amount});
				a.buyer.TradePartial(a.seller.orders[0].amount);
				a.seller.TradeOver();
			}else {
				a.dones = append(a.dones, Trade{time.Now().Format("2006-01-02 15:04:05"), bo.order_id, so.order_id, so.price, so.amount});
				a.buyer.TradeOver();
				a.seller.TradeOver();
			}
			a.marketPrice = bo.price;
		}
	}
}

func (a *Agent)Deal(q chan Trade, QUIT chan int) {
	tick := time.Tick(100 * time.Millisecond);
	result := Trade{};
	for {
		select {
		case <-tick:
			a.seller.mux.Lock();
			a.buyer.mux.Lock();
			a.Trade();			
			a.buyer.mux.Unlock();
			a.seller.mux.Unlock();
		case q <- result:
			fmt.Println("Agent result", result);
			if len(a.dones) > 0 {
				fmt.Println("result", result);
				result = a.dones[0];
			}
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
	a := Agent{marketPrice:100.0, c_query:make(chan Trade), c_quit:make(chan int)};
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
	price float64 `json:"marketPrice"`;
	trade Trade `json:"trade"`;
	order Order `json:"order"`;
}
func (g Log) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
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
	//for {
		select {
		case o := <- agent.c_query:
			fmt.Println("agent Send:", o)
			for i, c := range conn {
				log := Log{price:agent.marketPrice, trade:o};
				//str := fmt.Sprint(o);
				//err := c.Write(str);
				fmt.Println("agent Send", log);
				//err := websocket.JSON.Send(c, log);
				b, err := json.Marshal(log)
				fmt.Println("agent Send  ----", string(b[:]));
				err = websocket.Message.Send(c, string(b[:]));
				if err != nil {
					fmt.Println("agent Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case s := <- agent.seller.c_query:
			fmt.Println("seller Send:", s);
			for i, c := range conn {
				log := Log{order:s};
				fmt.Println("seller Send", log);
				//err := websocket.JSON.Send(c, log);
				b, err := json.Marshal(log)
				fmt.Println("agent Send  ----", string(b[:]));
				err = websocket.Message.Send(c, string(b[:]));
				if err != nil {
					fmt.Println("seller Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case b := <- agent.buyer.c_query:
			fmt.Println("buyer Send:", b);
			for i, c := range conn {
				log := Log{order:b};
				fmt.Println("buyer Send", log);
				//err := websocket.JSON.Send(c, log);
				err := websocket.Message.Send(c, fmt.Sprint(log));
				if err != nil {
					fmt.Println("buyer Closing", err);
					conn = append(conn[:i],conn[i:]...);
				}
			}
		case <-agent.c_quit:
			fmt.Println("Quit!");
			return;
		}
	//}
}

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
	mux.HandleFunc("/cancel", CancelOrder)

	fmt.Println("WebServer at 8081");
	http.Handle("/", http.FileServer(http.Dir("./test")));
 	http.ListenAndServe(":8081", mux)
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
}

func MakeOrder(w http.ResponseWriter, r *http.Request) {
	result := false;
	var order_req OrderRequest;
	if r.Method == "GET" {
		jsonDataFromHttp := reflect.ValueOf(r.URL.Query()).MapKeys();
		str := fmt.Sprint(jsonDataFromHttp[0]);
		err := json.Unmarshal([]byte(str), &order_req)
		if err == nil {
			fmt.Println("MakeOrder", order_req);
			pri := order_req.Price;
			
			if strings.Contains(order_req.Clazz, "market") {
				pri = agent.marketPrice;
			}
			if strings.Contains(order_req.Clazz, "buy") {
				if pri <= agent.marketPrice * 1.1 {
					o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), order_id:global_id, clazz:order_req.Clazz, price:pri, status:""};
					agent.buyer.c_order <- o;
					result = true;
				}
			}else if strings.Contains(order_req.Clazz, "sell") {
				if pri >= agent.marketPrice * 0.9 {
					o := Order{	time:time.Now().Format("2006-01-02 15:04:05"), order_id:global_id, clazz:order_req.Clazz, price:pri, status:""};
					agent.seller.c_order <- o;
					result = true;
				}
			}
			global_id ++;
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*");
	if result == true {
		js, _ := json.Marshal(OrderResponse{result, fmt.Sprint(global_id), order_req.Clazz});	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{result, "0", order_req.Clazz});
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
		js, _ := json.Marshal(OrderResponse{result, fmt.Sprint(global_id), order_req.Clazz});	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{result, "0", order_req.Clazz});
		w.Write([]byte(js));
	}
}
func DepthOrder(w http.ResponseWriter, r *http.Request) {
    result := false;
	var d []Order;
	if r.Method == "GET" {
		d = append(d, agent.buyer.Print()...);
		d = append(d, agent.seller.Print()...);
	}
	if result == true {
		js, _ := json.Marshal(d);	
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(d);
		w.Write([]byte(js));
	}
}
