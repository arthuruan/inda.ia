export const mockCode = `
GithubRepo/Application/AppCoordinator.swift:
//
//  AppCoordinator.swift
//  GithubRepo
//
//  Created by Marcos Alves on 18/10/21.
//

import Foundation
import UIKit

class AppCoordinator: Coordinator {
    var isCompleted: (() -> Void)?

    var childCoordinators = [Coordinator]()

    private let window: UIWindow

    init(windowScene: UIWindowScene) {
        self.window = UIWindow(frame: windowScene.coordinateSpace.bounds)
        self.window.windowScene = windowScene
    }

    func start() {
        let tabController = UITabBarController()
        let coordinator = MainCoordinator(rootViewController: tabController)
        coordinator.start()
        self.window.rootViewController = coordinator.rootViewController
        self.window.makeKeyAndVisible()
    }
}


GithubRepo/Application/AppDelegate.swift:
//
//  AppDelegate.swift
//  GithubRepo
//
//  Created by Marcos Alves on 06/09/21.
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ UIApplication,
        didFinishLaunchingWithOptions [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(
        _ UIApplication,
        configurationForConnecting UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ UIApplication, didDiscardSceneSessions Set<UISceneSession>) {
    }
}


GithubRepo/Application/SceneDelegate.swift:
//
//  SceneDelegate.swift
//  GithubRepo
//
//  Created by Marcos Alves on 06/09/21.
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    private var coordinator: AppCoordinator?

    func scene(
        _ UIScene,
        willConnectTo UISceneSession,
        options UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else {
            return
        }
        self.coordinator = AppCoordinator(windowScene: windowScene)
        self.coordinator?.start()
    }
}


GithubRepo/Common/Coordinator.swift:
//
//  Coordinator.swift
//  GithubRepo
//
//  Created by Marcos Alves on 16/10/21.
//

import Foundation
import UIKit

protocol Coordinator {
    var rootViewController: UITabBarController { get }
}

protocol Coordinator {
    var rootViewController: UINavigationController { get }
}

protocol AnyObject {
    var childCoordinators: [Coordinator] { get set }
    // This closure must be invoked whenever the coordnator ends its flow to notify
    // the parent coordinator to free the current child [MA]
    var isCompleted: (() -> Void)? { get set }

    func start()
}

extension Coordinator {
    func store(coordinator: Coordinator) {
        coordinator.isCompleted = { [weak self, weak coordinator] in
            if let coordinator = coordinator {
                self?.free(coordinator: coordinator)
            }
        }
        childCoordinators.append(coordinator)
    }

    func free(coordinator: Coordinator) {
        childCoordinators = childCoordinators.filter { $0 !== coordinator }
    }
}


GithubRepo/Data/DTO/DataMapper.swift:
//
//  DataMapper.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation

protocol DataMapper {
    associatedtype DataModel
    associatedtype DomainModel

    static func map(_ DataModel) -> DomainModel
}


GithubRepo/Data/DTO/OwnerResponse.swift:
//
//  OwnerResponse.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation

struct DataMapper {
    static func map(_ OwnerResponse) -> Owner {
        Owner(id: data.id, name: data.login, avatar: URL(string: data.avatarUrl))
    }
}

struct Decodable {
    let id: Int64
    let login: String
    let avatarUrl: String

    private enum CodingKeys: String, CodingKey {
        case avatarUrl = "avatar_url"
        case id, login
    }
}


GithubRepo/Data/DTO/RepositoryResponse.swift:
//
//  RepositoryResponse.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation

struct DataMapper {
    static func map(_ RepositoryResponse) -> Repository {
        Repository(
            id: data.id,
            name: data.name,
            description: data.description,
            language: data.language,
            forks: data.forks,
            stars: data.stars,
            owner: OwnerResponseMapper.map(data.owner)
        )
    }
}

struct Decodable {
    let id: Int64
    let name: String
    let description: String?
    let language: String?
    let forks: Int
    let stars: Int
    let owner: OwnerResponse

    private enum CodingKeys: String, CodingKey {
        case stars = "watchers"
        case id, name, description, language, forks, owner
    }
}


GithubRepo/Data/DTO/SearchRepoResponse.swift:
//
//  SearchRepoResponse.swift
//  GithubRepo
//
//  Created by Marcos Alves on 29/09/21.
//

import Foundation

struct Decodable {
    let totalCount: Int64
    let incompleteResults: Bool
    let items: [RepositoryResponse]

    private enum CodingKeys: String, CodingKey {
        case totalCount = "total_count"
        case incompleteResults = "incomplete_results"
        case items
    }
}


GithubRepo/Data/DataSource/GithubDataSource.swift:
//
//  GithubDataSource.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation
import RxSwift

protocol GithubDataSource {
    func getRepositories(with query: String) -> Single<[Repository]>
}


GithubRepo/Data/DataSource/RemoteGithubDataSource.swift:
//
//  RemoteGithubDataSource.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation
import RxSwift

class RemoteGithubDataSource: GithubDataSource {
    private let service: GithubFetcher

    init(service: GithubFetcher = RemoteGithubFetcher()) {
        self.service = service
    }

    func getRepositories(with query: String) -> Single<[Repository]> {
        return self.service.fetchRepositories(with: query)
            .map { response in
                response.1.items.map { RepositoryResponseMapper.map($0) }
            }
    }
}


GithubRepo/Data/Repository/GithubMainRepository.swift:
//
//  GithubMainRepository.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation
import RxRelay
import RxSwift

class GithubMainRepository: GithubRepository {
    private let dataSource: GithubDataSource
    private let disposeBag = DisposeBag()

    let repositories: BehaviorRelay<[Repository]>
    let state: BehaviorRelay<FetchState>

    init(dataSource: GithubDataSource = RemoteGithubDataSource()) {
        self.dataSource = dataSource
        self.repositories = BehaviorRelay<[Repository]>(value: [])
        self.state = BehaviorRelay<FetchState>(value: .inital)
    }

    func handleChangeRepositories(_ [Repository]) {
        self.repositories.accept(repo)
    }

    func handleChangeState(_ FetchState) {
        self.state.accept(state)
    }

    func fetchRepositories(with query: String) {
        self.handleChangeState(.loading)
        self.dataSource.getRepositories(with: query)
            .subscribe(
                onSuccess: { [weak self] in
                    self?.handleChangeRepositories($0)
                    self?.handleChangeState($0.isEmpty ? .empty: .content)
                },
                { [weak self] _ in
                    self?.handleChangeState(.error)
                }
            )
            .disposed(by: disposeBag)
    }
}


GithubRepo/Data/Repository/GithubRepository.swift:
//
//  GithubRepository.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation
import RxRelay

enum FetchState {
    case loading, error, content, empty, inital
}

protocol GithubRepository {
    var repositories: BehaviorRelay<[Repository]> { get }
    var state: BehaviorRelay<FetchState> { get }

    func fetchRepositories(with query: String)
}


GithubRepo/Data/Services/GithubFetcher.swift:
//
//  GithubSearchable.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Foundation
import RxSwift

protocol GithubFetcher {
    func fetchRepositories(with query: String) -> Single<(HTTPURLResponse, SearchRepoResponse)>
}


GithubRepo/Data/Services/RemoteGithubFetcher.swift:
//
//  RemoteGithubFetcher.swift
//  GithubRepo
//
//  Created by Marcos Alves on 15/10/21.
//

import Alamofire
import Foundation
import RxAlamofire
import RxSwift

struct GithubFetcherConstants {
    static let kUrl = "https://api.github.com/search/repositories"
}

struct GithubFetcher {
    func fetchRepositories(with query: String) -> Single<(HTTPURLResponse, SearchRepoResponse)> {
        guard let url = URL(string: GithubFetcherConstants.kUrl) else {
            return Single.error(URLError(.badURL))
        }
        return RxAlamofire.requestDecodable(.get, url, parameters: ["q": query]).asSingle()
    }
}


GithubRepo/Models/Owner.swift:
//
//  Owner.swift
//  GithubRepo
//
//  Created by Marcos Alves on 29/09/21.
//

import Foundation

struct Codable {
    let id: Int64
    let name: String
    let avatar: URL?
}


GithubRepo/Models/Repository.swift:
//
//  Repository.swift
//  GithubRepo
//
//  Created by Marcos Alves on 29/09/21.
//

import Foundation

struct Codable {
    let id: Int64
    let name: String
    let description: String?
    let language: String?
    let forks: Int
    let stars: Int
    let owner: Owner
}


GithubRepo/Scenes/About/AboutCoordinator.swift:
//
//  AboutCoordinator.swift
//  GithubRepo
//
//  Created by Marcos Alves on 18/10/21.
//

import Foundation
import UIKit

class AboutCoordinator: NavigationCoordinator {
    var isCompleted: (() -> Void)?

    var rootViewController: UINavigationController

    var childCoordinators = [Coordinator]()

    init(rootViewController: UINavigationController) {
        self.rootViewController = rootViewController
    }

    func start() {
        let aboutViewController = AboutViewController()
        setupRootViewController()
        self.rootViewController.setViewControllers([aboutViewController], animated: true)
    }

    private func setupRootViewController() {
        rootViewController.navigationBar.prefersLargeTitles = true
        rootViewController.navigationBar.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        rootViewController.tabBarItem.title = "About"
        rootViewController.tabBarItem.image = UIImage(systemName: "info.circle")
    }
}


GithubRepo/Scenes/About/AboutViewController.swift:
//
//  AboutViewController.swift
//  GithubRepo
//
//  Created by Marcos Alves on 07/09/21.
//

import UIKit

class AboutViewController: UIViewController {
    // MARK: - View Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        prepareUI()
    }

    // MARK: - Setup

    func prepareUI() {
        navigationItem.title = "About"
    }
}


GithubRepo/Scenes/Main/MainCoordinator.swift:
//
//  MainCoordinator.swift
//  GithubRepo
//
//  Created by Marcos Alves on 16/10/21.
//

import Foundation
import UIKit

class MainCoordinator: TabCoordinator {
    // MARK: - Properties

    var isCompleted: (() -> Void)?
    var childCoordinators = [Coordinator]()
    var rootViewController: UITabBarController

    // MARK: - Constructors

    init(rootViewController: UITabBarController) {
        self.rootViewController = rootViewController
    }

    // MARK: - Methods

    func start() {
        let aboutCoordinator = AboutCoordinator(rootViewController: UINavigationController())
        let searchCoordinator = SearchCoordinator(rootViewController: UINavigationController())

        self.store(coordinator: aboutCoordinator)
        self.store(coordinator: searchCoordinator)

        aboutCoordinator.start()
        searchCoordinator.start()

        rootViewController.setViewControllers(
            [searchCoordinator.rootViewController, aboutCoordinator.rootViewController],
            animated: true
        )
        rootViewController.tabBar.barTintColor = UIColor(named: "DarkGray")
        rootViewController.tabBar.isTranslucent = false
    }
}


GithubRepo/Scenes/Search/SearchCoordinator.swift:
//
//  SearchCoordinator.swift
//  GithubRepo
//
//  Created by Marcos Alves on 18/10/21.
//

import Foundation
import UIKit

class SearchCoordinator: NavigationCoordinator {
    var isCompleted: (() -> Void)?

    var rootViewController: UINavigationController

    var childCoordinators = [Coordinator]()

    init(rootViewController: UINavigationController) {
        self.rootViewController = rootViewController
    }

    func start() {
        let searchViewController = SearchViewController()
        let searchViewModel = SearchViewModel(coordinator: self)
        searchViewController.bindViewModel(to: searchViewModel)
        setupRootViewController()
        self.rootViewController.setViewControllers([searchViewController], animated: true)
    }

    private func setupRootViewController() {
        rootViewController.navigationBar.prefersLargeTitles = true
        rootViewController.navigationBar.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        rootViewController.navigationBar.barTintColor = .black
        rootViewController.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor: UIColor.white]
        rootViewController.title = "Search"
        rootViewController.tabBarItem.image = UIImage(systemName: "magnifyingglass")
    }
}


GithubRepo/Scenes/Search/View/Cell/RepositoryTableViewCell.swift:
//
//  RepositoryTableViewCell.swift
//  GithubRepo
//
//  Created by Marcos Alves on 29/09/21.
//

import Kingfisher
import UIKit

class RepositoryTableViewCell: UITableViewCell {
    static let kTableViewCellIdentifier = "RepositoryTableViewCell"
    private(set) var repositoryViewModel: RepositoryCellViewModel?

    // MARK: - UI Elements

    @IBOutlet private weak var ownerLabel: UILabel?
    @IBOutlet private weak var repositoryNameLabel: UILabel?
    @IBOutlet private weak var descriptionLabel: UILabel?
    @IBOutlet private weak var languageLabel: UILabel?
    @IBOutlet private weak var starsLabel: UILabel?
    @IBOutlet private weak var avatarImage: UIImageView?
    @IBOutlet private weak var languageIcon: UIImageView?

    // MARK: - View Lifecycle

    override func awakeFromNib() {
        super.awakeFromNib()
        prepareUI()
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        self.repositoryViewModel = nil
    }

    // MARK: - Setup

    private func prepareUI() {
        avatarImage?.layer.cornerRadius = 25
        avatarImage?.layer.borderWidth = 1.0
        avatarImage?.layer.borderColor = UIColor.white.cgColor
    }

    // MARK: - Helpers

    func setupCell(with repositoryViewModel: RepositoryCellViewModel) {
        self.repositoryViewModel = repositoryViewModel
        let repository = repositoryViewModel.repository

        ownerLabel?.text = repository.owner.name
        repositoryNameLabel?.text = repository.name
        descriptionLabel?.text = repository.description
        languageLabel?.text = repository.language
        starsLabel?.text = repository.stars.kmAbbreviation
        languageIcon?.tintColor = repository.language != nil ? UIColor.randomColor: UIColor.black

        if let url = repository.owner.avatar {
            avatarImage?.kf.setImage(with: url)
        }
    }
}


GithubRepo/Scenes/Search/View/SearchViewController.swift:
//
//  SearchViewController.swift
//  GithubRepo
//
//  Created by Marcos Alves on 07/09/21.
//

import RxCocoa
import RxRelay
import RxSwift
import UIKit

class SearchViewController: UIViewController {
    // MARK: - Constants

    private let kDebounceTime = 0.5
    private let kMinStringToSearch = 3
    private let kInitialSearchStateText = "Tente buscar por algum repositório"
    private let kEmptySearchStateText = "Nenhum repositorório encontrado"
    private let kErrorSearchStateText = "Desculpe! Ocorreu algum erro"

    // MARK: - Attributes

    private let disposeBag = DisposeBag()
    private var searchViewModel: SearchViewModel?
    private var searchTimer: Timer?

    // MARK: - UI Elements

    private lazy var searchController: UISearchController = {
        let searchController = UISearchController()
        searchController.searchBar.barStyle = .black
        searchController.searchBar.isTranslucent = false
        searchController.searchResultsUpdater = self
        return searchController
    }()

    private lazy var spinner: UIActivityIndicatorView = {
        let activity = UIActivityIndicatorView()
        activity.color = UIColor.white
        return activity
    }()

    @IBOutlet private weak var tableView: UITableView?
    @IBOutlet private weak var stateView: UIView?
    @IBOutlet private weak var stateImageView: UIImageView?
    @IBOutlet private weak var stateTextView: UILabel?

    // MARK: - View Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()

        registerTableViewCell()
        subscribeSearchState()
        subscribeTableData()
        prepareUI()
    }

    // MARK: - View Model

    func bindViewModel(to SearchViewModel) {
        self.searchViewModel = viewModel
    }

    // MARK: - Setup

    private func prepareUI() {
        navigationItem.title = "Repositories"
        navigationItem.searchController = searchController
        handleSearchInitialState()
        view.addSubview(spinner)
        spinner.translatesAutoresizingMaskIntoConstraints = false
        spinner.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        spinner.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16).isActive = true
    }

    private func registerTableViewCell() {
        tableView?.register(
            UINib(
                nibName: RepositoryTableViewCell.kTableViewCellIdentifier,
                bundle: nil
            ),
            RepositoryTableViewCell.kTableViewCellIdentifier
        )
    }

    // MARK: - Helper Methods

    private func handleSearchInitialState() {
        self.spinner.stopAnimating()
        self.stateView?.isHidden = false
        self.stateTextView?.text = kInitialSearchStateText
        self.stateImageView?.image = UIImage(named: "Bookmark")
    }

    private func handleSearchEmptyState() {
        self.spinner.stopAnimating()
        self.stateView?.isHidden = false
        self.stateTextView?.text = kEmptySearchStateText
        self.stateImageView?.image = UIImage(named: "BookmarkMad")
    }

    private func handleSearchErrorState() {
        self.spinner.stopAnimating()
        self.stateView?.isHidden = false
        self.stateTextView?.text = kErrorSearchStateText
        self.stateImageView?.image = UIImage(named: "BookmarkError")
    }

    private func handleSearchLoadingState() {
        self.spinner.startAnimating()
        self.stateView?.isHidden = true
    }

    private func handleSearchContentState() {
        self.spinner.stopAnimating()
        self.stateView?.isHidden = true
    }
}

// MARK: - Handle Notifications from View Model

extension SearchViewController {
    func subscribeSearchState() {
        searchViewModel?.state
            .asDriver()
            .drive { [weak self] value in
                switch value {
                case .self?.handleSearchInitialState()
                case .self?.handleSearchLoadingState()
                case .self?.handleSearchErrorState()
                case .self?.handleSearchEmptyState()
                case .self?.handleSearchContentState()
                }
            }
        .disposed(by: disposeBag)
    }

    func subscribeTableData() {
        guard let tableView = self.tableView else {
            return
        }
        searchViewModel?.repositoryCellViewModels.bind(
            to: tableView.rx.items(
                cellIdentifier: RepositoryTableViewCell.kTableViewCellIdentifier,
                cellType: RepositoryTableViewCell.self
            )) { _, item, cell in
            cell.setupCell(with: item)
        }
        .disposed(by: disposeBag)
    }
}

// MARK: - SearchBar Extension

extension UISearchResultsUpdating {
    func updateSearchResults(for searchController: UISearchController) {
        self.searchTimer?.invalidate()

        guard let text = searchController.searchBar.text else {
            return
        }
        searchTimer = Timer.scheduledTimer(
            withTimeInterval: kDebounceTime,
            repeats: false,
            block: { [weak self] _ in
                DispatchQueue.global(qos: .userInteractive).async { [weak self] in
                    if text.count > self?.kMinStringToSearch ?? 0 {
                        self?.searchViewModel?.fetchRepositories(query: text)
                    }
                }
            }
        )
    }
}


GithubRepo/Scenes/Search/ViewModel/RepositoryCellViewModel.swift:
//
//  RepositoryCellViewModel.swift
//  GithubRepo
//
//  Created by Marcos Alves on 12/10/21.
//

import Foundation

struct RepositoryCellViewModel {
    let repository: Repository
}


GithubRepo/Scenes/Search/ViewModel/SearchViewModel.swift:
//
//  SearchViewModel.swift
//  GithubRepo
//
//  Created by Marcos Alves on 09/10/21.
//

import Foundation
import RxRelay
import RxSwift

class SearchViewModel: ViewModelSearching {
    // MARK: - Attributes

    private let disposeBag = DisposeBag()
    private var githubRepository: GithubRepository
    private(set) var repositoryCellViewModels: BehaviorRelay<[RepositoryCellViewModel]>
    private(set) var state: BehaviorRelay<FetchState>
    private weak var coordinator: SearchCoordinator?

    // MARK: - Constructors

    init(coordinator: SearchCoordinator, repository: GithubRepository = GithubMainRepository()) {
        self.coordinator = coordinator
        self.repositoryCellViewModels = BehaviorRelay(value: [])
        self.state = BehaviorRelay(value: .inital)
        self.githubRepository = repository

        self.bindRepository()
    }

    // MARK: - Methods

    func fetchRepositories(query: String) {
        githubRepository.fetchRepositories(with: query)
    }

    private func bindRepository() {
        githubRepository.state
            .bind(to: self.state)
            .disposed(by: disposeBag)
        githubRepository.repositories
            .map({ repos in
               repos.map { RepositoryCellViewModel(repository: $0) }
            })
            .bind(to: self.repositoryCellViewModels)
            .disposed(by: disposeBag)
    }
}


GithubRepo/Scenes/Search/ViewModel/ViewModel.swift:
//
//  ViewModel.swift
//  GithubRepo
//
//  Created by Marcos Alves on 13/10/21.
//

import Foundation

protocol ViewModelSearching {
    func fetchRepositories(query: String)
}


GithubRepo/Utils/Extensions/Int+ConventIntoAFriendlyKMAbbr.swift:
//
//  Int+ConventIntoAFriendlyKMAbbr.swift
//  GithubRepo
//
//  Created by Marcos Alves on 01/10/21.
//

import Foundation

extension Int {
    // Reference link: https://stackoverflow.com/questions/36376897/swift-2-0-format-1000s-into-a-friendly-ks/36377091
    var kmAbbreviation: String {
        let number = Double(self)
        let thousand = number / 1_000
        let million = number / 1_000_000
        if million >= 1.0 {
            return "\\(round(million * 10) / 10)M"
        } else if thousand >= 1.0 {
            return "\\(round(thousand * 10) / 10)K"
        } else {
            return "\\(self)"
        }
    }
}


GithubRepo/Utils/Extensions/UIColors+RandomColor.swift:
//
//  UIColors+RandomColor.swift
//  GithubRepo
//
//  Created by Marcos Alves on 02/10/21.
//

import UIKit

extension UIColor {
    // Reference Link: https://gist.github.com/skreutzberger/32be80e2ebef71dfb793
    static var randomColor: UIColor {
        let red = CGFloat(drand48())
        let green = CGFloat(drand48())
        let blue = CGFloat(drand48())
        return UIColor(red: red, green: green, blue: blue, alpha: 1.0)
    }
}
`
