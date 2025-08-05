import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)
  const {id} = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: ({signal}) => fetchEvent({id, signal}),
  })

  const { mutate, isPending: isPendingDelete, isError: isErrorDeleting, error: errorDelete } = useMutation({
    mutationFn: ({ id }) => deleteEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event"], refetchType: "none" });
      navigate("/events");
    },
  });
  
  function handleStartDelete(){
    setIsDeleting(true)
  }
  function handleStopDelete(){
    setIsDeleting(false)
  }

  function handleDelete(id){
    mutate({id})
  }

  return (
    <>
      {isDeleting && (<Modal onClose={handleStopDelete}>
        <h2>Are you sure?</h2>
        <p>This cannot be undone!!</p>
        <div className='form-actions'>
          {isPendingDelete && <p>Deleting please wait...</p>}
          {
            !isPendingDelete && (
              <>
                <button onClick={handleStopDelete} className='button-text'>
                  Cancel
                </button>
                <button onClick={handleDelete} className='button'>
                  Delete
                </button>
              </>
            )
          }
          {
            isErrorDeleting && (
              <ErrorBlock title="Failed to delete event" message={errorDelete.info?.message || "Failed to delete event."} />
            )
          }
          <button onClick={handleStopDelete} className='button-text'>Cancel</button>
          <button onClick={() => handleDelete(data.id)} className='button'>Delete</button>
        </div>
      </Modal>)}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {
        isPending && <p>Loading...</p>
      }
      {
        isError && <ErrorBlock title="An error occured" message={error.info?.message || "Something went wrong."} />
      }
      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="image" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{new Date(data.date).toLocaleDateString("en-US",{day:"numeric", month:"short", year:"numeric"}) + " @" + data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>}
    </>
  );
}