import tornado.ioloop
import tornado.httpserver
import tornado.web


class MainHandler(tornado.web.RequestHandler):
    def get(self, url):
    	result = {"status" : "ok", "ip" : url}
        self.write(result)

app = tornado.web.Application([
        (r"/([^/]+)", MainHandler),
    ])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(8888)
    tornado.ioloop.IOLoop.current().start()