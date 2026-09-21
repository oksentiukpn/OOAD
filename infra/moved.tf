moved {
  from = aws_lb.backend
  to   = aws_lb.main
}

moved {
  from = aws_lb_listener.backend_http
  to   = aws_lb_listener.http
}
