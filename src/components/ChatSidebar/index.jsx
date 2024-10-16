
import defaultAvatar from '$/assets/avatar-default.svg';
import Search from '$/components/Search';
import { checkRequestSent } from '$/services/notification';
import { getFriends, loadUser } from '$/services/user';
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { TbUserPlus, TbUsersPlus } from "react-icons/tb";
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setLoading } from '../../features/notifications.slice';
import { setRequestedUser } from '../../features/requested.user';
import { setIsMobile, setUser } from '../../features/user.slice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getRandomEmoji } from '../../utils/emojis';
import { Conversation } from '../Conversation';
import Modal from '../Modal/Modal';
import UserStatus from '../UserStatus';
import styles from "./index.module.scss";
const ChatSideBar = () => {
    // const inputRef = useRef(null);
    const [isModal, setIsModal] = useState(false)
    const location = useLocation()
    const [isApear, setIsApear] = useState(true)
    const [lineLeft, setLineLeft] = useState('0');
    const [lineWidth, setLineWidth] = useState('0');
    const [searchData, setSearchData] = useState([])
    const [modalUser, setModalUser] = useState(null)
    const [requestSent, setRequestSent] = useState(false)
    const [friends, setListFriends] = useState([])
    const disPatch = useAppDispatch()
    const notisData = useAppSelector(state => state.notis.data?.metadata?.notisWithSender)
    const isNotisLoading = useAppSelector(state => state.notis.isLoading)
    const userData = useAppSelector(state => state.user.data)
    const isMobileChatContent = useAppSelector(state => state.user.isMobile)
    const [width, setWidth] = useState(window.innerWidth);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const isMobile = width <= 768;


    useEffect(() => {
        // use asynchronous function
        const fetchFriends = async () => {
            if (userData?.friends?.length) {
                try {
                    const friendsData = await Promise.all(
                        userData.friends.map(friend => getFriends(friend))
                    );
                    const listFriends = friendsData.map(friend => friend.metadata);
                    setListFriends(listFriends);
                    setIsApear(false);
                } catch (error) {
                    toast.error("Error fetching friends:", error);
                }
            }
        };
    
        fetchFriends();
    }, [userData?.friends]);

    useEffect(() => {
        const container = document.querySelector(`.${styles.container}`)
        if (isMobileChatContent && isMobile) {
            container.style.display = 'none'
        } else {
            container.style.display = 'flex'
        }
    }, [isMobileChatContent])

    useEffect(() => {
        const headerLinks = document.querySelector(`.${styles.header_links}`);
        const activeElement = document.querySelector('#active');
        
        const updateLinePosition = (element) => {
            setLineLeft(element.offsetLeft + 'px');
            setLineWidth(element.offsetWidth + 'px');
        };
    
        const setActiveLink = () => {
            if (headerLinks) {
                const children = Array.from(headerLinks.children);
                const activeChild = children.find((child) => child.getAttribute('id') === activeElement.id);
    
                if (activeChild) {
                    updateLinePosition(activeChild);
                }
            }
        };
    
        const handleChildClick = (child) => () => updateLinePosition(child);
    
        if (headerLinks) {
            const children = Array.from(headerLinks.children);
            children.forEach((child) => {
                child.addEventListener('click', handleChildClick(child));
            });
        }
    
        setActiveLink();
    
        return () => {
            if (headerLinks) {
                const children = Array.from(headerLinks.children);
                children.forEach((child) => {
                    child.removeEventListener('click', handleChildClick(child));
                });
            }
        };
    }, [location]);

    useEffect(() => {
        const myProfile = async () => {
            try {
                const results = await loadUser();
                disPatch(setUser(results?.metadata))
            } catch (error) {
                toast.error('User not found! ' + error?.response?.data?.message || error.message || error);
            }
        };

        myProfile();
    }, []);

    const handleApear = () => {
        if (!isNotisLoading && !isApear) {
            return (
                friends?.length > 0 && friends?.map((friend, idx) => (
                    <Conversation
                    key={friend._id}
                    friend={friend}
                    lastIdx={idx === friends.length - 1}
                    emoji={getRandomEmoji()} />
                ))
            )
        }
        
        if (isNotisLoading) {
            return (
                <>
                <div className={styles.wrapper}>
                    <span>lời mời kết bạn</span>
                </div>
                    {notisData?.length && notisData?.map(noti => (
                        <ul key={noti._id} className="w-full mb-4">
                            <li className="w-[60px] flex justify-center items-center" onClick={() => handleRequestedUser(noti.sender)}>
                                <div className='relative size-[60px] pt-[10px]'>
                                    <img src={noti.sender.avatar || defaultAvatar} alt="avatar" className="size-[40px] rounded-full object-cover" />
                                </div>
                                <div className="w-full flex items-center justify-center flex-col px-4">
                                    <div className="w-full flex items-center justify-between">
                                        <h6>{noti.sender.username}</h6>
                                    </div>
                                    <p className="max-h-[20px] pr-[10px] overflow-hidden text-ellipsis">{noti.sender.email}</p>
                                </div>
                            </li>
                        </ul>
                    ))}
                </>
            )
        }

        if (isApear) {
            return (
                searchData.length > 0 && searchData.map(user => (
                    <ul key={user._id} className="w-full mb-4" onClick={(e) => handleModal(e, user)}>
                        <li className="w-[60px] flex justify-center items-center">
                            <div className='relative size-[60px] pt-[10px]'>
                                <img src={user.avatar || defaultAvatar} alt="avatar" className="size-[40px] rounded-full object-cover" />
                                <UserStatus status={user.status === 'offline' ? 'inactive' : 'active'} />
                            </div>
                            <div className="w-full flex items-center justify-center flex-col px-4">
                                <div className="w-full flex items-center justify-between">
                                    <h6>{user.username}</h6>
                                    <time dateTime={user.updatedAt}>{new Date(user.updatedAt).toLocaleDateString()}</time>
                                </div>
                                <p className="max-h-[20px] pr-[10px] overflow-hidden text-ellipsis w-full text-start">{user.email}</p>
                            </div>
                        </li>
                    </ul>
                ))
            )
        }
    }
    const handleRequestedUser = (user) => {
        disPatch(setRequestedUser(user))
        disPatch(setIsMobile(true))
    }
    const handleData = (metadata) => {
        setSearchData(metadata)
        setIsApear(true)
    }
    const handleModal = async (e, user) => {
        e.stopPropagation()
        setIsModal(true)
        setModalUser(user)
        try {
            const results = await checkRequestSent(user._id)
            if (results.metadata.senderId === userData._id) setRequestSent(true)
                else setRequestSent(false)
        } catch (error) {
            setRequestSent(false)
        }
    }
    const handleModalStatus = (status) => {
        if (status === false) {
            setIsModal(false)
        }
    }

    const handleRenderFriends = () => {
        disPatch(setLoading(false))
        setIsApear(false)
        
        return (
            friends?.length > 0 && friends?.map((friend, idx) => (
                <Conversation
                key={friend._id}
                friend={friend} 
                lastIdx={idx === friends.length - 1} 
                emoji={getRandomEmoji()} />
            ))
        )
    }
    return (
        <div className={`${styles.container}`}>
                {/* Sidebar Header */}
                {userData && <div className={`w-full h-[150px] bubble-shadow ${styles.container_header}`}>
                    {/* Top Sidebar Header: Profile */}
                    <div className={`flex h-[60px] justify-between items-center ${styles.user_header}`}>
                        <div className={`flex items-center`}>
                            <div className='relative size-[50px] pt-[5px]'>
                                <img src={userData.avatar || defaultAvatar} alt="avatar" className="size-[40px] rounded-full object-cover" />
                                <UserStatus status='active' />
                            </div>
                            <h5 className="text-white font-mono min-w-[100px]">{userData.username}</h5>
                        </div>
                        <div className="flex items-center">
                            <IoEllipsisHorizontal />
                        </div>
                    </div>
                    {/* Middle Sidebar Header: Tools */}
                    <div className={`flex justify-center items-center ${styles.container_tools}`}>
                        <Search location={'users'} status={handleApear} data={handleData} />
                        <TbUserPlus/>
                        <TbUsersPlus />
                    </div>
                        {/* Bottom Sidebar Header: Options */}
                    <div className={styles.header_links}>
                        <span id='active' onClick={handleRenderFriends} >Đang hoạt động</span>
                        <span id='favorite'>Yêu thích</span>
                        <span id='all'>Tất cả</span>
                        <div className={styles.header_links_line} style={{ left: lineLeft, width: lineWidth }}></div>
                    </div>
                </div>}
                <div className={`h-full w-[305px] bubble-shadow overflow-scroll ${styles.container_content_list}`}>
                {handleApear()}

                </div>
                {isModal && modalUser !== null ? <Modal user={modalUser} status={handleModalStatus} isRequestSent={requestSent} /> : <></>}
            </div>
  );
};
ChatSideBar.propTypes = {
    userId: PropTypes.string,
};

export default ChatSideBar