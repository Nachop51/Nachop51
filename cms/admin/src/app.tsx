import { Route, Switch } from 'wouter'
import Navbar from './components/common/navbar'
import HomePage from './pages/home'
import PostPage from './pages/posts/post'
import NotFoundPage from './pages/404'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/posts/:id">{(params: { id: string }) => <PostPage id={params.id} />}</Route>

        <Route path="*" component={NotFoundPage} />
      </Switch>
    </div>
  )
}

export default App
